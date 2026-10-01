import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const FUR_PRICE = 500;

function generateOrderNumber() {
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const random = Math.floor(100000 + Math.random() * 900000);

  return `CNT-${date}-${random}`;
}

function getBasePrice(product) {
  if (
    product.discountedPrice !== null &&
    product.discountedPrice !== undefined &&
    Number(product.discountedPrice) > 0 &&
    Number(product.discountedPrice) < Number(product.price)
  ) {
    return Number(product.discountedPrice);
  }

  return Number(product.price);
}

function parseProductSizes(value) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function parseProductColors(value) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function calculateCouponDiscount(coupon, subtotal) {
  if (!coupon) {
    return 0;
  }

  if (subtotal < Number(coupon.minCartAmount || 0)) {
    return 0;
  }

  if (coupon.type === "PERCENT") {
    return Math.min(
      subtotal,
      subtotal * (Number(coupon.value) / 100)
    );
  }

  if (coupon.type === "FIXED") {
    return Math.min(subtotal, Number(coupon.value));
  }

  return 0;
}

/* -------------------------------------------------------
   GET
------------------------------------------------------- */

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: {
                    order: "asc",
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);

    return NextResponse.json(
      {
        error: "Siparişler alınırken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}

/* -------------------------------------------------------
   POST
------------------------------------------------------- */

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Sipariş oluşturmak için giriş yapmalısınız.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues?.[0]?.message ||
            "Geçersiz sipariş bilgileri.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      couponCode,
      items,
    } = parsed.data;

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "Kullanıcı bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    /* ---------------------------------------------------
       ÜRÜNLERİ DB'DEN AL
    --------------------------------------------------- */

    const productIds = [
      ...new Set(items.map((item) => item.productId)),
    ];

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    /* ---------------------------------------------------
       ÜRÜNLERİ VE SEÇENEKLERİ DOĞRULA
    --------------------------------------------------- */

    const validatedItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return NextResponse.json(
          {
            error: "Sepetteki ürünlerden biri bulunamadı.",
          },
          {
            status: 400,
          }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          {
            error: `"${product.name}" ürünü artık satışta değil.`,
          },
          {
            status: 400,
          }
        );
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          {
            error: `"${product.name}" için geçersiz adet.`,
          },
          {
            status: 400,
          }
        );
      }

      const sizes = parseProductSizes(product.sizes);
      const colors = parseProductColors(product.colors);

      if (!sizes.includes(String(item.size))) {
        return NextResponse.json(
          {
            error: `"${product.name}" için seçilen beden mevcut değil.`,
          },
          {
            status: 400,
          }
        );
      }

      if (
        item.color &&
        colors.length > 0 &&
        !colors.includes(String(item.color))
      ) {
        return NextResponse.json(
          {
            error: `"${product.name}" için seçilen renk mevcut değil.`,
          },
          {
            status: 400,
          }
        );
      }

      const furSelected = Boolean(item.furSelected);

      if (furSelected && !product.hasFurOption) {
        return NextResponse.json(
          {
            error: `"${product.name}" ürünü için kürk seçeneği kullanılamaz.`,
          },
          {
            status: 400,
          }
        );
      }

      const basePrice = getBasePrice(product);

      /*
       * Fiyat BURADA DB'den hesaplanıyor.
       *
       * Frontend'den gelen price değerine güvenilmiyor.
       */
      const unitPrice =
        basePrice + (furSelected ? FUR_PRICE : 0);

      validatedItems.push({
        product,
        productId: product.id,
        name: product.name,
        size: String(item.size),
        color: item.color
          ? String(item.color)
          : null,
        quantity,
        furSelected,
        unitPrice,
      });
    }

    /* ---------------------------------------------------
       SUBTOTAL
    --------------------------------------------------- */

    const subtotal = validatedItems.reduce(
      (sum, item) =>
        sum + item.unitPrice * item.quantity,
      0
    );

    /* ---------------------------------------------------
       COUPON
    --------------------------------------------------- */

    let coupon = null;
    let discount = 0;

    if (couponCode) {
      const normalizedCouponCode = String(couponCode)
        .trim()
        .toUpperCase();

      coupon = await prisma.coupon.findUnique({
        where: {
          code: normalizedCouponCode,
        },
      });

      if (!coupon) {
        return NextResponse.json(
          {
            error: "Geçersiz kupon kodu.",
          },
          {
            status: 400,
          }
        );
      }

      if (!coupon.isActive) {
        return NextResponse.json(
          {
            error: "Bu kupon aktif değil.",
          },
          {
            status: 400,
          }
        );
      }

      const now = new Date();

      if (
        coupon.startsAt &&
        now < new Date(coupon.startsAt)
      ) {
        return NextResponse.json(
          {
            error: "Bu kupon henüz kullanıma açılmadı.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        coupon.endsAt &&
        now > new Date(coupon.endsAt)
      ) {
        return NextResponse.json(
          {
            error: "Bu kuponun kullanım süresi doldu.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
      ) {
        return NextResponse.json(
          {
            error: "Bu kuponun kullanım limiti doldu.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        subtotal < Number(coupon.minCartAmount || 0)
      ) {
        return NextResponse.json(
          {
            error: `Bu kuponu kullanmak için minimum sepet tutarı ${Number(
              coupon.minCartAmount || 0
            ).toFixed(2)} ₺ olmalıdır.`,
          },
          {
            status: 400,
          }
        );
      }

      discount = calculateCouponDiscount(
        coupon,
        subtotal
      );
    }

    /* ---------------------------------------------------
       KARGO
    --------------------------------------------------- */

    /*
     * Mevcut sistemde shippingCost 0.
     * Daha sonra ücretsiz kargo limiti eklenebilir.
     */
    const shippingCost = 0;

    const total = Math.max(
      0,
      subtotal - discount + shippingCost
    );

    /* ---------------------------------------------------
       SİPARİŞ NUMARASI
    --------------------------------------------------- */

    let orderNumber;

    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generateOrderNumber();

      const existing = await prisma.order.findUnique({
        where: {
          orderNumber: candidate,
        },
        select: {
          id: true,
        },
      });

      if (!existing) {
        orderNumber = candidate;
        break;
      }
    }

    if (!orderNumber) {
      return NextResponse.json(
        {
          error:
            "Sipariş numarası oluşturulamadı. Lütfen tekrar deneyin.",
        },
        {
          status: 500,
        }
      );
    }

    /* ---------------------------------------------------
       TRANSACTION
    --------------------------------------------------- */

    const order = await prisma.$transaction(
      async (tx) => {
        /*
         * Stokları transaction içinde tekrar kontrol ediyoruz.
         *
         * Böylece iki farklı kişi aynı anda son ürünü almaya
         * çalışırsa stok eksiye düşmez.
         */
        for (const item of validatedItems) {
          const stockUpdate =
            await tx.product.updateMany({
              where: {
                id: item.productId,
                isActive: true,
                stock: {
                  gte: item.quantity,
                },
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });

          if (stockUpdate.count !== 1) {
            throw new Error(
              `STOCK_ERROR:${item.productId}:${item.name}`
            );
          }
        }

        /*
         * Kuponu transaction içinde tekrar kontrol ediyoruz.
         *
         * Böylece iki kişi aynı anda son kupon kullanımını
         * tüketmeye çalıştığında limit aşılmıyor.
         */
        let finalCoupon = null;

        if (coupon) {
          finalCoupon = await tx.coupon.findUnique({
            where: {
              id: coupon.id,
            },
          });

          if (!finalCoupon) {
            throw new Error(
              "COUPON_ERROR:Kupon bulunamadı."
            );
          }

          if (!finalCoupon.isActive) {
            throw new Error(
              "COUPON_ERROR:Kupon artık aktif değil."
            );
          }

          const now = new Date();

          if (
            finalCoupon.startsAt &&
            now < new Date(finalCoupon.startsAt)
          ) {
            throw new Error(
              "COUPON_ERROR:Kupon henüz kullanıma açılmadı."
            );
          }

          if (
            finalCoupon.endsAt &&
            now > new Date(finalCoupon.endsAt)
          ) {
            throw new Error(
              "COUPON_ERROR:Kuponun kullanım süresi doldu."
            );
          }

          if (
            finalCoupon.usageLimit !== null &&
            finalCoupon.usedCount >=
              finalCoupon.usageLimit
          ) {
            throw new Error(
              "COUPON_ERROR:Kuponun kullanım limiti doldu."
            );
          }

          const couponUpdate =
            await tx.coupon.updateMany({
              where: {
                id: finalCoupon.id,
                isActive: true,
                ...(finalCoupon.usageLimit !== null
                  ? {
                      usedCount: {
                        lt: finalCoupon.usageLimit,
                      },
                    }
                  : {}),
              },
              data: {
                usedCount: {
                  increment: 1,
                },
              },
            });

          if (couponUpdate.count !== 1) {
            throw new Error(
              "COUPON_ERROR:Kupon kullanım limiti doldu."
            );
          }
        }

        const createdOrder =
          await tx.order.create({
            data: {
              orderNumber,
              userId: user.id,

              customerName,
              customerEmail,
              customerPhone,
              shippingAddress,

              subtotal,
              shippingCost,
              discount,
              total,

              couponCode: coupon
                ? coupon.code
                : null,

              paymentStatus: "pending_payment",
              status: "PAYMENT_PENDING",

              items: {
                create: validatedItems.map(
                  (item) => ({
                    productId: item.productId,
                    name: item.name,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    furSelected:
                      item.furSelected,
                  })
                ),
              },
            },

            include: {
              items: true,
            },
          });

        return createdOrder;
      }
    );

    return NextResponse.json(
      {
        success: true,
        order,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/orders error:",
      error
    );

    const message = error?.message || "";

    if (message.startsWith("STOCK_ERROR:")) {
      const parts = message.split(":");
      const productName =
        parts.slice(2).join(":") ||
        "Ürün";

      return NextResponse.json(
        {
          error: `"${productName}" için yeterli stok bulunmuyor.`,
        },
        {
          status: 400,
        }
      );
    }

    if (message.startsWith("COUPON_ERROR:")) {
      return NextResponse.json(
        {
          error:
            message.replace(
              "COUPON_ERROR:",
              ""
            ) || "Kupon kullanılamadı.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Sipariş oluşturulurken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}
