import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaytrCallback } from "@/lib/paytr";

// PAYTR bu URL'e server-to-server POST bildirimi gönderir.
// PAYTR panelindeki "Bildirim URL" burası olmalıdır.
//
// Başarılı ve geçerli callback sonrasında:
// OK
// dönülür.

export async function POST(req) {
  try {
    // --------------------------------------------------
    // READ PAYTR FORM DATA
    // --------------------------------------------------

    const formData = await req.formData();

    const params = Object.fromEntries(
      formData.entries()
    );

    console.log("PAYTR callback received:", {
      merchant_oid: params.merchant_oid,
      status: params.status,
      total_amount: params.total_amount,
    });

    // --------------------------------------------------
    // HASH VALIDATION
    // --------------------------------------------------

    const isValid = verifyPaytrCallback(params);

    if (!isValid) {
      console.error(
        "PAYTR callback hash doğrulaması başarısız.",
        {
          merchant_oid: params.merchant_oid,
        }
      );

      return new NextResponse(
        "PAYTR notification failed: bad hash",
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // MERCHANT OID
    // --------------------------------------------------

    const merchantOid =
      params.merchant_oid?.toString().trim();

    if (!merchantOid) {
      console.error(
        "PAYTR callback merchant_oid bulunamadı."
      );

      return new NextResponse(
        "PAYTR notification failed: missing merchant_oid",
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // PAYTR TOTAL
    // --------------------------------------------------

    /*
     * PAYTR total_amount kuruş cinsindendir.
     *
     * Örnek:
     * 3500.00 TL -> 350000
     *
     * Bizim DB'deki order.total ise TL cinsindedir.
     */

    const paytrTotalRaw =
      params.total_amount?.toString().trim();

    const paytrTotalKurus =
      Number(paytrTotalRaw);

    if (
      !paytrTotalRaw ||
      !Number.isFinite(paytrTotalKurus) ||
      paytrTotalKurus < 0
    ) {
      console.error(
        "PAYTR callback total_amount geçersiz.",
        {
          merchant_oid: merchantOid,
          total_amount: paytrTotalRaw,
        }
      );

      return new NextResponse(
        "PAYTR notification failed: invalid total_amount",
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // FIND ORDER
    // --------------------------------------------------

    const order =
      await prisma.order.findUnique({
        where: {
          paytrMerchantOid: merchantOid,
        },
        include: {
          items: true,
        },
      });

    /*
     * Sipariş bulunamadığında PAYTR'nin sürekli
     * tekrar denemesini istemiyoruz.
     */
    if (!order) {
      console.warn(
        "PAYTR callback için sipariş bulunamadı:",
        merchantOid
      );

      return new NextResponse("OK");
    }

    // --------------------------------------------------
    // TOTAL AMOUNT VALIDATION
    // --------------------------------------------------

    /*
     * PAYTR'den gelen ödeme tutarı ile bizim
     * veritabanındaki sipariş tutarı birebir aynı
     * olmalıdır.
     *
     * Bu kontrol özellikle önemlidir çünkü:
     *
     * - Kürk seçeneği +500 TL
     * - Kupon indirimi
     * - Kargo
     *
     * gibi hesapların tamamı server tarafında
     * oluşturulan order.total üzerinden yapılır.
     */

    const expectedTotalKurus =
      Math.round(Number(order.total) * 100);

    if (
      paytrTotalKurus !== expectedTotalKurus
    ) {
      console.error(
        "PAYTR ödeme tutarı sipariş tutarıyla eşleşmiyor.",
        {
          orderNumber: order.orderNumber,
          merchantOid,
          paytrTotalKurus,
          expectedTotalKurus,
          orderTotal: order.total,
        }
      );

      /*
       * Hash geçerli olsa bile tutar bizim
       * siparişimizle uyuşmuyorsa siparişi
       * PAID yapmıyoruz.
       */
      return new NextResponse(
        "PAYTR notification failed: amount mismatch",
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // DUPLICATE CALLBACK
    // --------------------------------------------------

    /*
     * Bu sipariş daha önce kesin olarak işlendiyse
     * tekrar stok veya ödeme işlemi yapmıyoruz.
     */
    if (order.paytrProcessed) {
      console.log(
        "PAYTR callback zaten işlenmiş:",
        order.orderNumber
      );

      return new NextResponse("OK");
    }

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    if (params.status === "success") {
      /*
       * ÖNEMLİ:
       *
       * Stok /api/orders içerisinde zaten düşürüldü.
       *
       * Bu nedenle burada tekrar:
       *
       * stock: { decrement: quantity }
       *
       * YAPMIYORUZ.
       *
       * Aksi halde stok iki kere azalır.
       */

      await prisma.$transaction(
        async (tx) => {
          /*
           * Aynı anda gelen duplicate callback'lere karşı
           * önce paytrProcessed durumunu kontrol ediyoruz.
           */
          const currentOrder =
            await tx.order.findUnique({
              where: {
                id: order.id,
              },
              select: {
                paytrProcessed: true,
                paymentStatus: true,
              },
            });

          if (
            !currentOrder ||
            currentOrder.paytrProcessed
          ) {
            return;
          }

          await tx.order.update({
            where: {
              id: order.id,
            },
            data: {
              paymentStatus: "paid",
              status: "PAID",
              paytrProcessed: true,
            },
          });
        }
      );

      console.log(
        "PAYTR ödeme başarılı:",
        order.orderNumber
      );

      return new NextResponse("OK");
    }

    // --------------------------------------------------
    // PAYMENT FAILED
    // --------------------------------------------------

    /*
     * /api/orders sırasında stoklar sipariş için
     * rezerve edildi.
     *
     * Ödeme başarısız olursa bu rezervasyonu
     * geri vermemiz gerekiyor.
     */

    if (params.status !== "success") {
      await prisma.$transaction(
        async (tx) => {
          // --------------------------------------------
          // CURRENT ORDER
          // --------------------------------------------

          const currentOrder =
            await tx.order.findUnique({
              where: {
                id: order.id,
              },
              select: {
                paytrProcessed: true,
                paymentStatus: true,
              },
            });

          /*
           * Başka bir callback aynı anda işlemişse
           * hiçbir şey yapma.
           */
          if (
            !currentOrder ||
            currentOrder.paytrProcessed
          ) {
            return;
          }

          // --------------------------------------------
          // RESTORE STOCK
          // --------------------------------------------

          for (const item of order.items) {
            await tx.product.update({
              where: {
                id: item.productId,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }

          // --------------------------------------------
          // MARK ORDER FAILED
          // --------------------------------------------

          await tx.order.update({
            where: {
              id: order.id,
            },
            data: {
              paymentStatus: "payment_failed",
              status: "CANCELLED",
              paytrProcessed: true,
            },
          });
        }
      );

      console.log(
        "PAYTR ödeme başarısız, stok geri verildi:",
        order.orderNumber
      );

      return new NextResponse("OK");
    }

    // --------------------------------------------------
    // FALLBACK
    // --------------------------------------------------

    return new NextResponse("OK");
  } catch (error) {
    console.error(
      "PAYTR callback error:",
      error
    );

    /*
     * Gerçek bir server hatasında 500 dönüyoruz.
     * Böylece PAYTR bildirimin tekrar işlenmesini
     * sağlayabilir.
     */
    return new NextResponse(
      "PAYTR notification failed",
      {
        status: 500,
      }
    );
  }
}
