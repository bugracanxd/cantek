import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaytrToken } from "@/lib/paytr";

export async function POST(req) {
  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId gerekli" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ error: "Bu sipariş zaten ödendi" }, { status: 400 });
  }

  const userIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const userBasket = order.items.map((i) => [i.name, i.unitPrice.toFixed(2), i.quantity]);

  try {
    const { token, merchantOid } = await createPaytrToken({ order, userIp, userBasket });

    // merchant_oid'i siparişe kaydet (callback'te eşleştirmek için)
    await prisma.order.update({
      where: { id: order.id },
      data: { paytrMerchantOid: merchantOid },
    });

    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
