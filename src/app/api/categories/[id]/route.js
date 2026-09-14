import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const category = await prisma.category.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ category });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
