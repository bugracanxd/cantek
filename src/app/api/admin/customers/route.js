import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, phone: true, createdAt: true, _count: { select: { orders: true } } },
  });
  return NextResponse.json({ customers });
}
