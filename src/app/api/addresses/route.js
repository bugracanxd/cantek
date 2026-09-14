import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { addressSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const addresses = await prisma.address.findMany({ where: { userId: session.user.id } });
  return NextResponse.json({ addresses });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const address = await prisma.address.create({ data: { ...parsed.data, userId: session.user.id } });
  return NextResponse.json({ address }, { status: 201 });
}
