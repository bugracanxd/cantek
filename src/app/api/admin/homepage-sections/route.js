import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const sections = await prisma.homepageSection.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ sections });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const body = await req.json();
  const count = await prisma.homepageSection.count();
  const section = await prisma.homepageSection.create({
    data: {
      type: body.type,
      title: body.title || "",
      isActive: true,
      order: count,
      data: JSON.stringify(body.data || {}),
    },
  });
  return NextResponse.json({ section }, { status: 201 });
}

// Sürükle-bırak sıralaması - tüm sıralamayı tek seferde günceller
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const { order } = await req.json(); // [{id, order}, ...]
  await prisma.$transaction(
    order.map((item) =>
      prisma.homepageSection.update({ where: { id: item.id }, data: { order: item.order } })
    )
  );
  return NextResponse.json({ success: true });
}
