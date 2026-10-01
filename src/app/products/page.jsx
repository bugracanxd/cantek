import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tüm Ürünler",
};

function buildListFilter(value) {
  if (!value) return null;

  const normalized = value.trim();

  if (!normalized) return null;

  return {
    OR: [
      { equals: normalized },
      { startsWith: `${normalized},` },
      { endsWith: `,${normalized}` },
      { contains: `,${normalized},` },
      { contains: `, ${normalized},` },
      { startsWith: `${normalized}, ` },
      { endsWith: `, ${normalized}` },
    ],
  };
}

export default async function AllProductsPage({ searchParams }) {
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
    where.colors = {
      ...colorFilter,
      OR: colorFilter.OR.map((condition) => ({
        ...condition,
      })),
    };
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

  const [products, categories, allProducts] = await Promise.all([
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

    prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    }),

    // Filtre seçeneklerini otomatik oluşturmak için
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
      allProducts
        .flatMap((product) =>
          product.sizes
            ? product.sizes
                .split(",")
                .map((size) => size.trim())
                .filter(Boolean)
            : []
        )
    ),
  ].sort((a, b) => Number(a) - Number(b));

  // ---------------- AVAILABLE COLORS ----------------

  const colors = [
    ...new Set(
      allProducts
        .flatMap((product) =>
          product.colors
            ? product.colors
                .split(",")
                .map((color) => color.trim())
                .filter(Boolean)
            : []
        )
    ),
  ].sort((a, b) => a.localeCompare(b, "tr"));

  return (
    <div className="site-container py-10">
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

      {/* Aktif filtreler */}
      {(categorySlug || size || color || sort) && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-sm text-gray-500 mr-1">
            Aktif filtreler:
          </span>

          {categorySlug && (
            <span className="px-3 py-1.5 rounded-full bg-black text-white text-xs">
              Kategori:{" "}
              {categories.find((c) => c.slug === categorySlug)?.name ||
                categorySlug}
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

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-500 mb-4">
            Seçtiğiniz filtrelere uygun ürün bulunamadı.
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
