import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";

// Admin: aktif/pasif tüm ürünleri listeler
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    include: { images: { orderBy: { order: "asc" }, take: 1 }, category: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json({ products });
}
