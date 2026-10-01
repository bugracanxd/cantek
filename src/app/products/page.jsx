import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tüm Ürünler",
};

// ----------------------------------------------------
// Ürünlerdeki sizes / colors verisini diziye çevirir
// Destekler:
// ["39","40","41"]
// 39,40,41
// 39, 40, 41
// ----------------------------------------------------

function parseProductList(value) {
  if (!value) return [];

  const text = String(value).trim();

  if (!text) return [];

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

// ----------------------------------------------------
// Bir ürünün string alanında belirli değeri arar
//
// Örnek:
// sizes = ["39","40","41"]
//
// 40 ararken:
// contains: '"40"'
// ----------------------------------------------------

function buildValueConditions(field, value) {
  return [
    {
      [field]: {
        equals: value,
      },
    },
    {
      [field]: {
        contains: `"${value}"`,
      },
    },
    {
      [field]: {
        startsWith: `${value},`,
      },
    },
    {
      [field]: {
        endsWith: `,${value}`,
      },
    },
    {
      [field]: {
        contains: `,${value},`,
      },
    },
    {
      [field]: {
        contains: `, ${value},`,
      },
    },
    {
      [field]: {
        startsWith: `${value}, `,
      },
    },
    {
      [field]: {
        endsWith: `, ${value}`,
      },
    },
  ];
}

// ----------------------------------------------------
// Virgülle gelen filtreleri OR haline getirir
//
// size=40,42,44
//
// sonuç:
//
// sizes 40 OR 42 OR 44
// ----------------------------------------------------

function buildMultiValueFilter(field, value) {
  if (!value) return null;

  const values = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (values.length === 0) {
    return null;
  }

  const conditions = values.flatMap((item) =>
    buildValueConditions(field, item)
  );

  return {
    OR: conditions,
  };
}

export default async function AllProductsPage({
  searchParams,
}) {
  const params = searchParams || {};

  const categorySlug = params.category || "";
  const sizeParam = params.size || "";
  const colorParam = params.color || "";
  const sort = params.sort || "";

  // ----------------------------------------------------
  // ANA WHERE
  // ----------------------------------------------------

  const where = {
    isActive: true,
  };

  // ----------------------------------------------------
  // CATEGORY
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // SIZE
  //
  // 40,42,44 seçildiyse:
  //
  // sizes 40
  // OR
  // sizes 42
  // OR
  // sizes 44
  // ----------------------------------------------------

  const sizeFilter = buildMultiValueFilter(
    "sizes",
    sizeParam
  );

  // ----------------------------------------------------
  // COLOR
  //
  // Siyah,Lacivert Deri seçildiyse:
  //
  // colors Siyah
  // OR
  // colors Lacivert Deri
  // ----------------------------------------------------

  const colorFilter = buildMultiValueFilter(
    "colors",
    colorParam
  );

  // ----------------------------------------------------
  // BEDEN + RENK
  //
  // İkisi de seçilmişse:
  //
  // (BEDEN 40 OR 42)
  //
  // AND
  //
  // (RENK Siyah OR Lacivert)
  // ----------------------------------------------------

  if (sizeFilter && colorFilter) {
    where.AND = [
      sizeFilter,
      colorFilter,
    ];
  } else if (sizeFilter) {
    where.AND = [sizeFilter];
  } else if (colorFilter) {
    where.AND = [colorFilter];
  }

  // ----------------------------------------------------
  // SORT
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // PRODUCTS
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------

  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      order: "asc",
    },
  });

  // ----------------------------------------------------
  // ALL PRODUCTS
  //
  // Filtre seçeneklerini oluşturmak için kullanıyoruz.
  // ----------------------------------------------------

  const allProducts = await prisma.product.findMany({
    where: {
      isActive: true,
    },

    select: {
      sizes: true,
      colors: true,
    },
  });

  // ----------------------------------------------------
  // SIZES
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // COLORS
  // ----------------------------------------------------

  const colors = [
    ...new Set(
      allProducts.flatMap((product) =>
        parseProductList(product.colors)
      )
    ),
  ].sort((a, b) =>
    a.localeCompare(b, "tr")
  );

  // ----------------------------------------------------
  // SEÇİLİ BEDENLER
  // ----------------------------------------------------

  const selectedSizes = sizeParam
    ? sizeParam
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  // ----------------------------------------------------
  // SEÇİLİ RENKLER
  // ----------------------------------------------------

  const selectedColors = colorParam
    ? colorParam
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

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
            size: sizeParam,
            color: colorParam,
            sort,
          }}
        />

      </div>

      {/* AKTİF FİLTRELER */}

      {(categorySlug ||
        selectedSizes.length > 0 ||
        selectedColors.length > 0 ||
        sort) && (
        <div className="flex flex-wrap items-center gap-2 mb-8">

          <span className="text-sm text-gray-500 mr-1">
            Aktif filtreler:
          </span>

          {/* CATEGORY */}

          {categorySlug && (
            <span className="px-3 py-1.5 rounded-full bg-black text-white text-xs">
              Kategori:{" "}
              {categories.find(
                (category) =>
                  category.slug === categorySlug
              )?.name || categorySlug}
            </span>
          )}

          {/* SIZES */}

          {selectedSizes.map((size) => (
            <span
              key={`size-${size}`}
              className="px-3 py-1.5 rounded-full bg-black text-white text-xs"
            >
              Beden: {size}
            </span>
          ))}

          {/* COLORS */}

          {selectedColors.map((color) => (
            <span
              key={`color-${color}`}
              className="px-3 py-1.5 rounded-full bg-black text-white text-xs"
            >
              Renk: {color}
            </span>
          ))}

          {/* SORT */}

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
