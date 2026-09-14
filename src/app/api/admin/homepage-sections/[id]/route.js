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
  const data = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.data !== undefined) data.data = JSON.stringify(body.data);

  const section = await prisma.homepageSection.update({ where: { id: params.id }, data });
  return NextResponse.json({ section });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  await prisma.homepageSection.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
