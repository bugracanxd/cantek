import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tüm Ürünler",
};

/**
 * sizes / colors alanlarını güvenli şekilde diziye çevirir.
 *
 * Desteklenen formatlar:
 *
 * ["39","40","41","42"]
 *
 * veya
 *
 * 39,40,41,42
 *
 * veya
 *
 * 39, 40, 41, 42
 */
function parseProductList(value) {
  if (!value) return [];

  const text = String(value).trim();

  if (!text) return [];

  // Önce JSON array deniyoruz
  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean);
    }
  } catch {
    // JSON değilse aşağıdaki normal string yöntemi kullanılacak
  }

  // Eski virgüllü format
  return text
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((item) =>
      item
        .trim()
        .replace(/^["']|["']$/g, "")
        .trim()
    )
    .filter(Boolean);
}

/**
 * Prisma tarafında hem JSON array hem CSV formatını
 * destekleyecek filtre oluşturur.
 */
function buildListFilter(value) {
  if (!value) return null;

  const normalized = value.trim();

  if (!normalized) return null;

  return {
    OR: [
      // Tek değer
      {
        equals: normalized,
      },

      // JSON array:
      // ["40","41","42"]
      {
        contains: `"${normalized}"`,
      },

      // CSV:
      // 40,41,42
      {
        startsWith: `${normalized},`,
      },
      {
        endsWith: `,${normalized}`,
      },
      {
        contains: `,${normalized},`,
      },
      {
        contains: `, ${normalized},`,
      },
      {
        startsWith: `${normalized}, `,
      },
      {
        endsWith: `, ${normalized}`,
      },
    ],
  };
}

export default async function AllProductsPage({
  searchParams,
}) {
  const params = searchParams || {};

  const categorySlug = params.category || "";
  const size = params.size || "";
  const color = params.color || "";
  const sort = params.sort || "";

  const where = {
    isActive: true,
  };

  // ---------------- CATEGORY ----------------

  if (categorySlug) {
    where.categories = {
      some: {
        category: {
          slug: categorySlug,
          isActive: true,
        },
      },
    };
  }

  // ---------------- SIZE ----------------

  const sizeFilter = buildListFilter(size);

  if (sizeFilter) {
    where.sizes = sizeFilter;
  }

  // ---------------- COLOR ----------------

  const colorFilter = buildListFilter(color);

  if (colorFilter) {
    where.colors = colorFilter;
  }

  // ---------------- SORT ----------------

  let orderBy = {
    order: "asc",
  };

  if (sort === "price-asc") {
    orderBy = {
      price: "asc",
    };
  }

  if (sort === "price-desc") {
    orderBy = {
      price: "desc",
    };
  }

  const [
    products,
    categories,
    allProducts,
  ] = await Promise.all([
    prisma.product.findMany({
      where,

      include: {
        images: {
          orderBy: {
            order: "asc",
          },
          take: 1,
        },

        categories: {
          include: {
            category: true,
          },
        },
      },

      orderBy,
    }),

    // Aktif kategoriler
    prisma.category.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        order: "asc",
      },
    }),

    // Filtre seçeneklerini oluşturmak için
    prisma.product.findMany({
      where: {
        isActive: true,
      },

      select: {
        sizes: true,
        colors: true,
      },
    }),
  ]);

  // ---------------- AVAILABLE SIZES ----------------

  const sizes = [
    ...new Set(
      allProducts.flatMap((product) =>
        parseProductList(product.sizes)
      )
    ),
  ].sort((a, b) => {
    const numberA = Number(a);
    const numberB = Number(b);

    if (
      !Number.isNaN(numberA) &&
      !Number.isNaN(numberB)
    ) {
      return numberA - numberB;
    }

    return a.localeCompare(b, "tr");
  });

  // ---------------- AVAILABLE COLORS ----------------

  const colors = [
    ...new Set(
      allProducts.flatMap((product) =>
        parseProductList(product.colors)
      )
    ),
  ].sort((a, b) =>
    a.localeCompare(b, "tr")
  );

  return (
    <div className="site-container py-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

        <div>
          <h1 className="font-heading text-3xl font-semibold">
            Tüm Ürünler
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            {products.length} ürün
          </p>
        </div>

        <ProductFilters
          categories={categories}
          sizes={sizes}
          colors={colors}
          currentFilters={{
            category: categorySlug,
            size,
            color,
            sort,
          }}
        />

      </div>

      {/* ACTIVE FILTERS */}

      {(categorySlug ||
        size ||
        color ||
        sort) && (
        <div className="flex flex-wrap items-center gap-2 mb-8">

          <span className="text-sm text-gray-500 mr-1">
            Aktif filtreler:
          </span>

          {categorySlug && (
            <span className="px-3 py-1.5 rounded-full bg-black text-white text-xs">
              Kategori:{" "}
              {categories.find(
                (category) =>
                  category.slug === categorySlug
              )?.name || categorySlug}
            </span>
          )}

          {size && (
            <span className="px-3 py-1.5 rounded-full bg-black text-white text-xs">
              Beden: {size}
            </span>
          )}

          {color && (
            <span className="px-3 py-1.5 rounded-full bg-black text-white text-xs">
              Renk: {color}
            </span>
          )}

          {sort === "price-asc" && (
            <span className="px-3 py-1.5 rounded-full bg-black text-white text-xs">
              Fiyat: Düşük → Yüksek
            </span>
          )}

          {sort === "price-desc" && (
            <span className="px-3 py-1.5 rounded-full bg-black text-white text-xs">
              Fiyat: Yüksek → Düşük
            </span>
          )}

        </div>
      )}

      {/* PRODUCTS */}

      {products.length === 0 ? (
        <div className="py-20 text-center">

          <p className="text-gray-500 mb-4">
            Seçtiğiniz filtrelere uygun ürün
            bulunamadı.
          </p>

          <a
            href="/products"
            className="inline-flex px-5 py-2.5 rounded-full bg-black text-white text-sm"
          >
            Filtreleri Temizle
          </a>

        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}

        </div>
      )}

    </div>
  );
}
