import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export async function GET(req, { params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, category: true },
  });
  if (!product) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { images, sizes, colors, ...rest } = parsed.data;
  const data = { ...rest };
  if (sizes) data.sizes = JSON.stringify(sizes);
  if (colors) data.colors = JSON.stringify(colors);

  if (images !== undefined) {
    await prisma.productImage.deleteMany({ where: { productId: params.id } });
    data.images = { create: images.map((url, i) => ({ url, order: i })) };
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data,
    include: { images: true },
  });

  return NextResponse.json({ product });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
