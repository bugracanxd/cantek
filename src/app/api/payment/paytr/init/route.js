import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createPaytrToken } from "@/lib/paytr";

export async function POST(req) {
  try {
    // --------------------------------------------------
    // SESSION
    // --------------------------------------------------

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Ödeme başlatmak için giriş yapmalısınız.",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------
    // REQUEST
    // --------------------------------------------------

    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Geçersiz istek.",
        },
        {
          status: 400,
        }
      );
    }

    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        {
          error: "orderId gerekli",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // FIND ORDER
    // --------------------------------------------------

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Sipariş bulunamadı",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // ORDER OWNERSHIP
    // --------------------------------------------------

    let isOwner = false;

    if (
      session.user.id &&
      order.userId === session.user.id
    ) {
      isOwner = true;
    }

    /*
     * Bazı NextAuth session yapılandırmalarında
     * user.id bulunmayabilir. Email üzerinden de
     * kontrol ediyoruz.
     */
    if (
      !isOwner &&
      session.user.email &&
      order.customerEmail
    ) {
      isOwner =
        session.user.email
          .toLowerCase()
          .trim() ===
        order.customerEmail
          .toLowerCase()
          .trim();
    }

    if (!isOwner) {
      return NextResponse.json(
        {
          error:
            "Bu sipariş için ödeme yetkiniz yok.",
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------------------------
    // PAYMENT STATUS
    // --------------------------------------------------

    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        {
          error: "Bu sipariş zaten ödendi.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      order.status === "CANCELLED" ||
      order.paymentStatus === "cancelled"
    ) {
      return NextResponse.json(
        {
          error:
            "İptal edilmiş bir sipariş için ödeme başlatılamaz.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // ORDER TOTAL
    // --------------------------------------------------

    /*
     * ÇOK ÖNEMLİ:
     *
     * PayTR'ye gönderilecek tutarı frontend'den
     * ALMIYORUZ.
     *
     * /api/orders tarafından server üzerinde
     * hesaplanıp DB'ye kaydedilen order.total
     * kullanılıyor.
     *
     * Böylece:
     *
     * normal ürün:
     * 3000 TL
     *
     * kürklü ürün:
     * 3000 + 500 = 3500 TL
     *
     * indirim:
     * server tarafından hesaplanan gerçek indirim
     *
     * kargo:
     * server tarafından hesaplanan gerçek kargo
     *
     * şeklinde PayTR'ye gider.
     */

    const orderTotal = Number(order.total);

    if (
      !Number.isFinite(orderTotal) ||
      orderTotal <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Sipariş toplamı geçersiz.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // USER IP
    // --------------------------------------------------

    const forwardedFor =
      req.headers.get("x-forwarded-for");

    const userIp =
      forwardedFor
        ?.split(",")[0]
        ?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // --------------------------------------------------
    // PAYTR BASKET
    // --------------------------------------------------

    /*
     * PayTR sepetindeki ürün fiyatları da
     * OrderItem.unitPrice üzerinden geliyor.
     *
     * OrderItem.unitPrice server tarafından
     * oluşturulduğu için burada da frontend
     * fiyatına güvenilmiyor.
     */

    const userBasket = order.items.map((item) => [
      String(item.name),
      Number(item.unitPrice).toFixed(2),
      Number(item.quantity),
    ]);

    // --------------------------------------------------
    // PAYTR TOTAL CONSISTENCY CHECK
    // --------------------------------------------------

    /*
     * Ürünlerin toplamını kontrol ediyoruz.
     *
     * Order.total;
     * subtotal
     * - discount
     * + shipping
     *
     * şeklinde hesaplanmış olmalı.
     *
     * Bu kontrol PayTR'ye yanlış bir sepet
     * gönderilmesini önlemek için ek güvenliktir.
     */

    const basketSubtotal = order.items.reduce(
      (sum, item) =>
        sum +
        Number(item.unitPrice) *
          Number(item.quantity),
      0
    );

    const calculatedSubtotal = Number(
      basketSubtotal.toFixed(2)
    );

    const calculatedTotal = Number(
      (
        calculatedSubtotal -
        Number(order.discount || 0) +
        Number(order.shippingCost || 0)
      ).toFixed(2)
    );

    if (
      Math.abs(calculatedTotal - orderTotal) >
      0.01
    ) {
      console.error(
        "PAYTR toplam tutar uyuşmazlığı:",
        {
          orderId: order.id,
          orderTotal,
          calculatedTotal,
          calculatedSubtotal,
          discount: order.discount,
          shippingCost: order.shippingCost,
        }
      );

      return NextResponse.json(
        {
          error:
            "Sipariş tutarı doğrulanamadı.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // CREATE PAYTR TOKEN
    // --------------------------------------------------

    const {
      token,
      merchantOid,
    } = await createPaytrToken({
      order,
      userIp,
      userBasket,
    });

    if (!token) {
      return NextResponse.json(
        {
          error:
            "PAYTR ödeme tokenı alınamadı.",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------
    // SAVE MERCHANT OID
    // --------------------------------------------------

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paytrMerchantOid: merchantOid,
      },
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      token,
    });
  } catch (error) {
    console.error(
      "POST /api/payment/paytr/init error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Ödeme başlatılırken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}
