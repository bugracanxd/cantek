import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
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

    if (!product) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);

    return NextResponse.json(
      { error: "Ürün alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
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
        {
          error:
            parsed.error.issues?.[0]?.message ||
            "Geçersiz ürün bilgileri",
        },
        { status: 400 }
      );
    }

    let {
      images,
      sizes,
      colors,
      categoryIds,
      hasFurOption,
      ...rest
    } = parsed.data;

    images = Array.isArray(images)
      ? images
          .map((img) =>
            typeof img === "string" ? img : img?.url
          )
          .filter(Boolean)
      : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: {
          id: params.id,
        },

        data: {
          ...rest,

          ...(hasFurOption !== undefined && {
            hasFurOption: Boolean(hasFurOption),
          }),

          ...(sizes !== undefined && {
            sizes: JSON.stringify(sizes),
          }),

          ...(colors !== undefined && {
            colors: JSON.stringify(colors),
          }),
        },
      });

      // Görseller gönderildiyse mevcut görselleri yenile
      if (images !== undefined) {
        await tx.productImage.deleteMany({
          where: {
            productId: params.id,
          },
        });

        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((url, index) => ({
              productId: params.id,
              url,
              order: index,
            })),
          });
        }
      }

      // Kategoriler gönderildiyse mevcut kategorileri yenile
      if (categoryIds !== undefined) {
        await tx.productCategory.deleteMany({
          where: {
            productId: params.id,
          },
        });

        if (categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: categoryIds.map((categoryId) => ({
              productId: params.id,
              categoryId,
            })),
          });
        }
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
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);

    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Ürün bulunamadı." },
        { status: 404 }
      );
    }

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "Bu ürün slug veya SKU zaten kullanılıyor.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Ürün güncellenirken bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
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

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);

    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Ürün bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Ürün silinirken bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}
