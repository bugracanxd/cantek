import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const isOwner = session?.user?.id && order.userId === session.user.id;
  const isAdmin = requireAdmin(session);
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  return NextResponse.json({ order });
}

// Admin: sipariş durumu güncelleme
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const body = await req.json();
  const allowedStatuses = [
    "PAYMENT_PENDING", "PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED",
  ];
  if (body.status && !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
  }
  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status: body.status },
  });
  return NextResponse.json({ order });
}
