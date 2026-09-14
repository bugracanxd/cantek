import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const menus = await prisma.menu.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ menus });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const body = await req.json();
  const count = await prisma.menu.count({ where: { location: body.location || "header" } });
  const menu = await prisma.menu.create({
    data: {
      label: body.label,
      url: body.url,
      location: body.location || "header",
      order: count,
      isActive: true,
    },
  });
  return NextResponse.json({ menu }, { status: 201 });
}
