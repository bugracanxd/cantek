import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mergeSettings } from "@/lib/theme";

export async function POST(req) {
  try {
    const { code, subtotal } = await req.json();

    const normalizedCode = (code || "").trim().toUpperCase();
    const cartSubtotal = Number(subtotal);

    if (!normalizedCode || !Number.isFinite(cartSubtotal) || cartSubtotal < 0) {
      return NextResponse.json(
        { valid: false, error: "Geçersiz kupon bilgisi." },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    const now = new Date();

    if (
      !coupon ||
      !coupon.isActive ||
      cartSubtotal < coupon.minCartAmount ||
      (coupon.startsAt && coupon.startsAt > now) ||
      (coupon.endsAt && coupon.endsAt < now) ||
      (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    ) {
      return NextResponse.json({
        valid: false,
        error: "Kupon kodu geçersiz veya kullanım şartları karşılanmıyor.",
      });
    }

    let discount =
      coupon.type === "PERCENT"
        ? (cartSubtotal * coupon.value) / 100
        : coupon.value;

    discount = Math.min(discount, cartSubtotal);

    // Site ayarlarını al
    const settingsRow = await prisma.siteSettings.findUnique({
      where: { id: "main" },
    });

    let settingsData = null;

    try {
      settingsData = settingsRow?.data
        ? JSON.parse(settingsRow.data)
        : null;
    } catch (e) {
      console.error("SiteSettings JSON hatası:", e);
      settingsData = null;
    }

    const settings = mergeSettings(settingsData);

    const afterDiscount = cartSubtotal - discount;

    const shippingCost =
      afterDiscount >= settings.shipping.freeShippingThreshold
        ? 0
        : settings.shipping.flatRate;

    const total = afterDiscount + shippingCost;

    return NextResponse.json({
      valid: true,
      couponCode: coupon.code,
      discount,
      shippingCost,
      total,
    });
  } catch (error) {
    console.error("Kupon doğrulama hatası:", error);

    return NextResponse.json(
      {
        valid: false,
        error: "Kupon kontrol edilirken bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}
