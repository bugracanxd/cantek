import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tüm Ürünler",
};

// JSON veya normal virgüllü string'i diziye çevirir
function parseProductList(value) {
  if (!value) return [];

  const text = String(value).trim();

  if (!text) return [];

  // JSON formatı:
  // ["39","40","41","42"]
  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean);
    }
  } catch {
    // JSON değilse normal string olarak devam
  }

  // Eski format:
  // 39,40,41,42
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

// JSON array veya CSV formatındaki string alanında
// belirli bir değeri bulmak için Prisma koşulları
function buildStringConditions(field, value) {
  if (!value) return [];

  const normalized = String(value).trim();

  return [
    {
      [field]: {
        equals: normalized,
      },
    },
    {
      [field]: {
        contains: `"${normalized}"`,
      },
    },
    {
      [field]: {
        startsWith: `${normalized},`,
      },
    },
    {
      [field]: {
        endsWith: `,${normalized}`,
      },
    },
    {
      [field]: {
        contains: `,${normalized},`,
      },
    },
    {
      [field]: {
        contains: `, ${normalized},`,
      },
    },
    {
      [field]: {
        startsWith: `${normalized}, `,
      },
    },
    {
      [field]: {
        endsWith: `, ${normalized}`,
      },
    },
  ];
}

export default async function AllProductsPage({
  searchParams,
}) {
  const params = searchParams || {};

  const categorySlug = params.category || "";
  const size = params.size || "";
  const color = params.color || "";
  const sort = params.sort || "";

  // ---------------- WHERE ----------------

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

  if (size) {
    const sizeConditions = buildStringConditions(
      "sizes",
      size
    );

    where.OR = sizeConditions;
  }

  // ---------------- COLOR ----------------

  if (color) {
    const colorConditions = buildStringConditions(
      "colors",
      color
    );

    // Eğer hem beden hem renk seçildiyse
    // ikisinin de sağlanması gerekiyor.
    if (size) {
      delete where.OR;

      where.AND = [
        {
          OR: buildStringConditions("sizes", size),
        },
        {
          OR: buildStringConditions("colors", color),
        },
      ];
    } else {
      where.OR = colorConditions;
    }
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

  // ---------------- PRODUCTS ----------------

  const products = await prisma.product.findMany({
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
  });

  // ---------------- CATEGORIES ----------------

  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      order: "asc",
    },
  });

  // ---------------- FILTER DATA ----------------

  const allProducts = await prisma.product.findMany({
    where: {
      isActive: true,
    },

    select: {
      sizes: true,
      colors: true,
    },
  });

  // ---------------- SIZES ----------------

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

  // ---------------- COLORS ----------------

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
