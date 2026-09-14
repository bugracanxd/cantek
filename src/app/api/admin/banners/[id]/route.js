import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const body = await req.json();
  const banner = await prisma.banner.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ banner });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  await prisma.banner.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
