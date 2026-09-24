import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { order: "asc" } },
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Bulunamadı" },
      { status: 404 }
    );
  }

  return NextResponse.json({ product });
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!requireAdmin(session)) {
    return NextResponse.json(
      { error: "Yetkisiz erişim" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const parsed = productSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  let {
    images = [],
    sizes,
    colors,
    categoryIds = [],
    ...rest
  } = parsed.data;

  images = (images || [])
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter(Boolean);

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(sizes !== undefined && {
          sizes: JSON.stringify(sizes),
        }),
        ...(colors !== undefined && {
          colors: JSON.stringify(colors),
        }),
      },
    });

    await tx.productImage.deleteMany({
      where: {
        productId: params.id,
      },
    });

    if (images.length) {
      await tx.productImage.createMany({
        data: images.map((url, index) => ({
          productId: params.id,
          url,
          order: index,
        })),
      });
    }

    await tx.productCategory.deleteMany({
      where: {
        productId: params.id,
      },
    });

    if (categoryIds.length) {
      await tx.productCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          productId: params.id,
          categoryId,
        })),
      });
    }
  });

  const product = await prisma.product.findUnique({
    where: {
      id: params.id,
    },
    include: {
      images: {
        orderBy: {
          order: "asc",
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  return NextResponse.json({ product });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!requireAdmin(session)) {
    return NextResponse.json(
      { error: "Yetkisiz erişim" },
      { status: 401 }
    );
  }

  await prisma.product.delete({
    where: {
      id: params.id,
    },
  });

  return NextResponse.json({ success: true });
}
