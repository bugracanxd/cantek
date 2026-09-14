import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tüm Ürünler",
};

export default async function AllProductsPage({ searchParams }) {
  const categorySlug = searchParams?.category;

  const where = { isActive: true };
  if (categorySlug) where.category = { slug: categorySlug };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
      orderBy: { order: "asc" },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="site-container py-10">
      <h1 className="font-heading text-3xl font-semibold mb-8">Tüm Ürünler</h1>

      <div className="flex flex-wrap gap-2 mb-10">
        <a
          href="/products"
          className={`px-4 py-2 rounded-full text-sm border transition-colors ${!categorySlug ? "bg-black text-white border-black" : "hover:border-black"}`}
        >
          Tümü
        </a>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/products?category=${c.slug}`}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${categorySlug === c.slug ? "bg-black text-white border-black" : "hover:border-black"}`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">
          Henüz ürün eklenmemiş. Admin panelinden{" "}
          <a href="/admin/products/new" className="underline">
            yeni bir ürün ekleyin
          </a>
          .
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
