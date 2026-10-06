import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaytrCallback } from "@/lib/paytr";
import { sendOrderEmails } from "@/lib/email";

// PAYTR bu URL'e server-to-server POST bildirimi gönderir.
// Başarılı ve geçerli callback sonrasında "OK" dönülür.

export async function POST(req) {
  try {
    const formData = await req.formData();

    const params = Object.fromEntries(formData.entries());

    console.log("PAYTR callback received:", {
      merchant_oid: params.merchant_oid,
      status: params.status,
      total_amount: params.total_amount,
    });

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

    const order =
      await prisma.order.findUnique({
        where: {
          paytrMerchantOid: merchantOid,
        },
        include: {
          items: true,
        },
      });

    if (!order) {
      console.warn(
        "PAYTR callback için sipariş bulunamadı:",
        merchantOid
      );

      return new NextResponse("OK");
    }

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

      return new NextResponse(
        "PAYTR notification failed: amount mismatch",
        {
          status: 400,
        }
      );
    }

    // Aynı callback daha önce işlendi ise tekrar işlem yapma.
    if (order.paytrProcessed) {
      console.log(
        "PAYTR callback zaten işlenmiş:",
        order.orderNumber
      );

      return new NextResponse("OK");
    }

    // ---------------------------------------------------------
    // BAŞARILI ÖDEME
    // ---------------------------------------------------------

    if (params.status === "success") {
      let paymentProcessed = false;

      await prisma.$transaction(
        async (tx) => {
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

          paymentProcessed = true;
        }
      );

      console.log(
        "PAYTR ödeme başarılı:",
        order.orderNumber
      );

      // Ödeme gerçekten işlendi ise mailleri gönder.
      if (paymentProcessed) {
        try {
          const emailOrder =
            await prisma.order.findUnique({
              where: {
                id: order.id,
              },
              include: {
                items: true,
              },
            });

          if (emailOrder) {
            await sendOrderEmails(emailOrder);

            console.log(
              "CANTEK sipariş mailleri gönderildi:",
              emailOrder.orderNumber
            );
          }
        } catch (emailError) {
          // Mail hatası ödeme işlemini başarısız yapmaz.
          console.error(
            "CANTEK sipariş maili gönderilemedi:",
            emailError
          );
        }
      }

      return new NextResponse("OK");
    }

    // ---------------------------------------------------------
    // BAŞARISIZ / İPTAL ÖDEME
    // ---------------------------------------------------------

    if (params.status !== "success") {
      await prisma.$transaction(
        async (tx) => {
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

          // Ödeme başarısızsa stokları geri ekle.
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

    return new NextResponse("OK");
  } catch (error) {
    console.error(
      "PAYTR callback error:",
      error
    );

    return new NextResponse(
      "PAYTR notification failed",
      {
        status: 500,
      }
    );
  }
}
