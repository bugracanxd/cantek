import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaytrCallback } from "@/lib/paytr";

// PAYTR bu URL'e sunucudan sunucuya (server-to-server) bildirim POST eder.
// Bu endpoint PAYTR panelinde "Bildirim URL" olarak tanımlanmalı.
// Yanıt olarak DÜZ METİN "OK" dönmemiz zorunlu, aksi halde PAYTR tekrar dener.
export async function POST(req) {
  const formData = await req.formData();
  const params = Object.fromEntries(formData.entries());

  const isValid = verifyPaytrCallback(params);
  if (!isValid) {
    // Hash uyuşmuyorsa isteği reddet ama yine de 200 dönmüyoruz ki PAYTR fark etsin.
    return new NextResponse("PAYTR notification failed: bad hash", { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { paytrMerchantOid: params.merchant_oid } });
  if (!order) {
    // Sipariş yoksa yine de OK dönüyoruz (PAYTR'nin sürekli retry etmesini önlemek için)
    return new NextResponse("OK");
  }

  // Duplicate callback koruması: sipariş zaten işlenmişse tekrar işleme
  if (order.paytrProcessed) {
    return new NextResponse("OK");
  }

  if (params.status === "success") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "paid",
        status: "PAID",
        paytrProcessed: true,
      },
    });

    // Stokları düş
    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "payment_failed",
        status: "CANCELLED",
        paytrProcessed: true,
      },
    });
  }

  return new NextResponse("OK");
}
