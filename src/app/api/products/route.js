import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// Ürünleri listele
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q");
  const category = searchParams.get("category");

  const where = {
    isActive: true,
  };

  if (q) {
    where.name = {
      contains: q,
      mode: "insensitive",
    };
  }

  if (category) {
    where.categories = {
      some: {
        category: {
          slug: category,
        },
      },
    };
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
      categories: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return NextResponse.json({ products });
}

// Admin: yeni ürün oluştur
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!requireAdmin(session)) {
    return NextResponse.json(
      { error: "Yetkisiz erişim" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const {
    images,
    sizes,
    colors,
    categoryIds = [],
    ...rest
  } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...rest,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),

      images: {
        create: images.map((url, i) => ({
          url,
          order: i,
        })),
      },

      categories: {
        create: categoryIds.map((id) => ({
          categoryId: id,
        })),
      },
    },

    include: {
      images: true,
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
