import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ banners });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const body = await req.json();
  const count = await prisma.banner.count();
  const banner = await prisma.banner.create({ data: { ...body, order: count } });
  return NextResponse.json({ banner }, { status: 201 });
}
