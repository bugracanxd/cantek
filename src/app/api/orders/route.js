import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/order-number";
import { mergeSettings } from "@/lib/theme";
import { rateLimit } from "@/lib/rate-limit";

// Müşterinin kendi siparişlerini listeler
// Müşterinin kendi siparişlerini listeler
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return NextResponse.json({ orders });
}

// Sipariş oluşturma - FİYATLAR HER ZAMAN SUNUCUDA, VERİTABANINDAN OKUNUR.
// Frontend'den gelen fiyat bilgisine ASLA güvenilmez.
export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const allowed = true;
  console.log("POST /api/orders başladı");

  const session = await getServerSession(authOptions);

  const dbUser = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email.toLowerCase().trim() },
      })
    : null;

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { items, couponCode, ...customer } = parsed.data;

  // Ürünleri veritabanından çek, stok ve fiyat kontrolü yap
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItemsData = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: `Ürün bulunamadı: ${item.productId}` }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Yetersiz stok: ${product.name}` }, { status: 400 });
    }
    const unitPrice = product.discountedPrice || product.price; // sunucudan gelen gerçek fiyat
    subtotal += unitPrice * item.quantity;
    orderItemsData.push({
      productId: product.id,
      name: product.name,
      size: item.size,
      color: item.color || "",
      quantity: item.quantity,
      unitPrice,
    });
  }

  // Kupon doğrulama
  let discount = 0;
  let validCouponCode = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    const now = new Date();
    if (
      coupon &&
      coupon.isActive &&
      subtotal >= coupon.minCartAmount &&
      (!coupon.startsAt || coupon.startsAt <= now) &&
      (!coupon.endsAt || coupon.endsAt >= now) &&
      (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)
    ) {
      discount = coupon.type === "PERCENT" ? (subtotal * coupon.value) / 100 : coupon.value;
      discount = Math.min(discount, subtotal);
      validCouponCode = coupon.code;
    }
  }

  // Kargo hesaplama (site ayarlarından)
  const settingsRow = await prisma.siteSettings.findUnique({
  where: { id: "main" },
});

let settingsData = null;

try {
  settingsData = settingsRow?.data ? JSON.parse(settingsRow.data) : null;
} catch (e) {
  console.error("SiteSettings JSON hatası:", settingsRow?.data);
  settingsData = null;
}

const settings = mergeSettings(settingsData);
console.log("Settings:", settings);
  const afterDiscount = subtotal - discount;
  const shippingCost =
    afterDiscount >= settings.shipping.freeShippingThreshold ? 0 : settings.shipping.flatRate;

  const total = afterDiscount + shippingCost;

  console.log("Order oluşturuluyor", {
  subtotal,
  shippingCost,
  discount,
  total,
  customer,
  orderItemsData,
});
    const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: dbUser?.id ?? null,
      customerName: customer.customerName,
      customerEmail: customer.customerEmail,
      customerPhone: customer.customerPhone,
      shippingAddress: customer.shippingAddress,
      subtotal,
      shippingCost,
      discount,
      total,
      couponCode: validCouponCode,
      paymentStatus: "pending_payment",
      status: "PAYMENT_PENDING",
      items: { create: orderItemsData },
    },
    include: { items: true },
  });

  if (validCouponCode) {
    await prisma.coupon.update({
      where: { code: validCouponCode },
      data: { usedCount: { increment: 1 } },
    });
  }

    return NextResponse.json({ order }, { status: 201 });
}