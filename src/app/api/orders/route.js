import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/order-number";
import { mergeSettings } from "@/lib/theme";

const FUR_PRICE = 500;

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function parseJsonArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

// --------------------------------------------------
// GET
// Müşterinin kendi siparişlerini listeler
// --------------------------------------------------

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "Giriş gerekli" },
        { status: 401 }
      );
    }

    let userId = session.user.id;

    /*
     * Bazı NextAuth kurulumlarında session.user.id bulunmayabilir.
     * Bu durumda email üzerinden gerçek DB kullanıcısını buluyoruz.
     */
    if (!userId && session.user.email) {
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email.toLowerCase().trim(),
        },
        select: {
          id: true,
        },
      });

      userId = user?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ orders });
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

// --------------------------------------------------
// POST
// Sipariş oluştur
// --------------------------------------------------

export async function POST(req) {
  try {
    console.log("POST /api/orders başladı");

    // --------------------------------------------------
    // SESSION
    // --------------------------------------------------

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          error:
            "Sipariş oluşturmak için giriş yapmalısınız.",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------

    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Geçersiz istek verisi.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      console.error(
        "Checkout validation error:",
        parsed.error.issues
      );

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
      items,
      couponCode,
      ...customer
    } = parsed.data;

    // --------------------------------------------------
    // EXTRA CUSTOMER VALIDATION
    // --------------------------------------------------

    if (!customer.customerName?.trim()) {
      return NextResponse.json(
        {
          error: "Ad soyad zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    if (!customer.customerEmail?.trim()) {
      return NextResponse.json(
        {
          error: "E-posta zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    if (!customer.customerPhone?.trim()) {
      return NextResponse.json(
        {
          error: "Telefon zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    if (!customer.shippingAddress?.trim()) {
      return NextResponse.json(
        {
          error: "Teslimat adresi zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "Sepetiniz boş.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // FIND USER
    // --------------------------------------------------

    const sessionEmail = session.user.email
      ?.toLowerCase()
      .trim();

    let dbUser = null;

    if (session.user.id) {
      dbUser = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
      });
    }

    if (!dbUser && sessionEmail) {
      dbUser = await prisma.user.findUnique({
        where: {
          email: sessionEmail,
        },
      });
    }

    if (!dbUser) {
      return NextResponse.json(
        {
          error:
            "Kullanıcı hesabınız bulunamadı. Lütfen tekrar giriş yapın.",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------
    // PRODUCT IDS
    // --------------------------------------------------

    const productIds = [
      ...new Set(
        items
          .map((item) => item.productId)
          .filter(Boolean)
      ),
    ];

    if (productIds.length === 0) {
      return NextResponse.json(
        {
          error: "Geçerli ürün bulunamadı.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // PRODUCTS FROM DATABASE
    // --------------------------------------------------

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    const productMap = new Map(
      products.map((product) => [
        product.id,
        product,
      ])
    );

    // --------------------------------------------------
    // CALCULATE ORDER ITEMS
    // --------------------------------------------------

    const orderItemsData = [];

    let subtotal = 0;

    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      const product = productMap.get(
        item.productId
      );

      // ----------------------------------------------
      // PRODUCT EXISTS
      // ----------------------------------------------

      if (!product || !product.isActive) {
        return NextResponse.json(
          {
            error:
              "Ürün bulunamadı veya satışa kapalı.",
          },
          {
            status: 400,
          }
        );
      }

      // ----------------------------------------------
      // QUANTITY
      // ----------------------------------------------

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return NextResponse.json(
          {
            error: `${product.name} için geçersiz adet.`,
          },
          {
            status: 400,
          }
        );
      }

      // ----------------------------------------------
      // STOCK
      // ----------------------------------------------

      if (product.stock < quantity) {
        return NextResponse.json(
          {
            error: `${product.name} için yeterli stok yok. Mevcut stok: ${product.stock}`,
          },
          {
            status: 400,
          }
        );
      }

      // ----------------------------------------------
      // SIZE VALIDATION
      // ----------------------------------------------

      const selectedSize = normalizeValue(
        item.size
      );

      const availableSizes =
        parseJsonArray(product.sizes).map(
          normalizeValue
        );

      if (
        availableSizes.length > 0 &&
        !availableSizes.includes(selectedSize)
      ) {
        return NextResponse.json(
          {
            error: `${product.name} için seçilen beden geçersiz.`,
          },
          {
            status: 400,
          }
        );
      }

      // ----------------------------------------------
      // COLOR VALIDATION
      // ----------------------------------------------

      const selectedColor = normalizeValue(
        item.color
      );

      const availableColors =
        parseJsonArray(product.colors).map(
          normalizeValue
        );

      if (
        selectedColor &&
        availableColors.length > 0 &&
        !availableColors.includes(selectedColor)
      ) {
        return NextResponse.json(
          {
            error: `${product.name} için seçilen renk geçersiz.`,
          },
          {
            status: 400,
          }
        );
      }

      // ----------------------------------------------
      // FUR OPTION
      // ----------------------------------------------

      const furSelected =
        item.furSelected === true ||
        item.furSelected === "true";

      /*
       * Müşteri kürk seçtiyse ürünün DB'deki
       * hasFurOption değeri kesinlikle true olmalı.
       *
       * Frontend bunu değiştiremez.
       */
      if (
        furSelected &&
        !product.hasFurOption
      ) {
        return NextResponse.json(
          {
            error:
              `${product.name} için kürk seçeneği mevcut değil.`,
          },
          {
            status: 400,
          }
        );
      }

      // ----------------------------------------------
      // BASE PRICE
      // ----------------------------------------------

      const basePrice =
        product.discountedPrice !== null &&
        product.discountedPrice !== undefined &&
        Number(product.discountedPrice) <
          Number(product.price)
          ? Number(product.discountedPrice)
          : Number(product.price);

      // ----------------------------------------------
      // FUR PRICE
      // ----------------------------------------------

      const unitPrice =
        basePrice +
        (furSelected ? FUR_PRICE : 0);

      // ----------------------------------------------
      // SUBTOTAL
      // ----------------------------------------------

      subtotal += unitPrice * quantity;

      // ----------------------------------------------
      // ORDER ITEM
      // ----------------------------------------------

      orderItemsData.push({
        productId: product.id,
        name: product.name,
        size: selectedSize,
        color: selectedColor || "",
        quantity,
        unitPrice,
        furSelected,
      });
    }

    // --------------------------------------------------
    // ROUND SUBTOTAL
    // --------------------------------------------------

    subtotal = Number(
      subtotal.toFixed(2)
    );

    // --------------------------------------------------
    // COUPON
    // --------------------------------------------------

    let discount = 0;
    let validCouponCode = null;

    if (couponCode) {
      const normalizedCouponCode =
        String(couponCode)
          .trim()
          .toUpperCase();

      if (normalizedCouponCode) {
        const coupon =
          await prisma.coupon.findUnique({
            where: {
              code: normalizedCouponCode,
            },
          });

        const now = new Date();

        const couponIsValid =
          coupon &&
          coupon.isActive &&
          subtotal >=
            Number(coupon.minCartAmount || 0) &&
          (!coupon.startsAt ||
            coupon.startsAt <= now) &&
          (!coupon.endsAt ||
            coupon.endsAt >= now) &&
          (!coupon.usageLimit ||
            coupon.usedCount <
              coupon.usageLimit);

        if (couponIsValid) {
          if (
            coupon.type?.toUpperCase() ===
            "PERCENT"
          ) {
            discount =
              (subtotal *
                Number(coupon.value || 0)) /
              100;
          } else {
            discount = Number(
              coupon.value || 0
            );
          }

          discount = Math.max(
            0,
            Math.min(discount, subtotal)
          );

          discount = Number(
            discount.toFixed(2)
          );

          validCouponCode = coupon.code;
        }
      }
    }

    // --------------------------------------------------
    // SITE SETTINGS / SHIPPING
    // --------------------------------------------------

    const settingsRow =
      await prisma.siteSettings.findUnique({
        where: {
          id: "main",
        },
      });

    let settingsData = null;

    try {
      settingsData = settingsRow?.data
        ? JSON.parse(settingsRow.data)
        : null;
    } catch (error) {
      console.error(
        "SiteSettings JSON hatası:",
        error
      );

      settingsData = null;
    }

    const settings =
      mergeSettings(settingsData);

    const freeShippingThreshold = Number(
      settings?.shipping
        ?.freeShippingThreshold ?? 0
    );

    const flatRate = Number(
      settings?.shipping?.flatRate ?? 0
    );

    const afterDiscount = Number(
      Math.max(0, subtotal - discount).toFixed(2)
    );

    const shippingCost =
      afterDiscount >=
      freeShippingThreshold
        ? 0
        : flatRate;

    const total = Number(
      (afterDiscount + shippingCost).toFixed(2)
    );

    // --------------------------------------------------
    // LOG
    // --------------------------------------------------

    console.log("Order oluşturuluyor:", {
      userId: dbUser.id,
      subtotal,
      discount,
      shippingCost,
      total,
      couponCode: validCouponCode,
      items: orderItemsData.map(
        (item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          furSelected: item.furSelected,
        })
      ),
    });

    // --------------------------------------------------
    // CREATE ORDER
    // --------------------------------------------------

    const order = await prisma.$transaction(
      async (tx) => {
        /*
         * Sipariş oluşturulmadan hemen önce stokları
         * transaction içerisinde tekrar kontrol ediyoruz.
         *
         * Böylece aynı ürün aynı anda iki farklı siparişte
         * satılırken stok problemi oluşma ihtimali azaltılır.
         */
        for (const item of orderItemsData) {
          const updatedProduct =
            await tx.product.findUnique({
              where: {
                id: item.productId,
              },
              select: {
                id: true,
                name: true,
                stock: true,
                isActive: true,
              },
            });

          if (
            !updatedProduct ||
            !updatedProduct.isActive
          ) {
            throw new Error(
              `${item.name} artık satışta değil.`
            );
          }

          if (
            updatedProduct.stock <
            item.quantity
          ) {
            throw new Error(
              `${item.name} için yeterli stok kalmadı.`
            );
          }

          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // ----------------------------------------------
        // CREATE ORDER
        // ----------------------------------------------

        const createdOrder =
          await tx.order.create({
            data: {
              orderNumber:
                generateOrderNumber(),

              userId: dbUser.id,

              customerName:
                customer.customerName.trim(),

              customerEmail:
                customer.customerEmail
                  .trim()
                  .toLowerCase(),

              customerPhone:
                customer.customerPhone.trim(),

              shippingAddress:
                customer.shippingAddress.trim(),

              subtotal,
              shippingCost,
              discount,
              total,

              couponCode:
                validCouponCode,

              paymentStatus:
                "pending_payment",

              status:
                "PAYMENT_PENDING",

              items: {
                create: orderItemsData,
              },
            },

            include: {
              items: true,
            },
          });

        // ----------------------------------------------
        // COUPON USAGE
        // ----------------------------------------------

        if (validCouponCode) {
          await tx.coupon.update({
            where: {
              code: validCouponCode,
            },
            data: {
              usedCount: {
                increment: 1,
              },
            },
          });
        }

        return createdOrder;
      }
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json(
      {
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

    /*
     * Transaction içerisindeki stok hatalarını
     * kullanıcıya düzgün şekilde göster.
     */
    if (
      error instanceof Error &&
      error.message
    ) {
      const knownErrors = [
        "artık satışta değil",
        "yeterli stok kalmadı",
      ];

      const isKnownError =
        knownErrors.some((message) =>
          error.message.includes(message)
        );

      if (isKnownError) {
        return NextResponse.json(
          {
            error: error.message,
          },
          {
            status: 400,
          }
        );
      }
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
