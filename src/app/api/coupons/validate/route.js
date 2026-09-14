import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const { code, subtotal } = await req.json();
  const coupon = await prisma.coupon.findUnique({ where: { code: (code || "").toUpperCase() } });
  const now = new Date();

  if (
    !coupon ||
    !coupon.isActive ||
    subtotal < coupon.minCartAmount ||
    (coupon.startsAt && coupon.startsAt > now) ||
    (coupon.endsAt && coupon.endsAt < now) ||
    (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
  ) {
    return NextResponse.json({ valid: false }, { status: 200 });
  }

  const discount = coupon.type === "PERCENT" ? (subtotal * coupon.value) / 100 : coupon.value;
  return NextResponse.json({ valid: true, discount: Math.min(discount, subtotal) });
}
