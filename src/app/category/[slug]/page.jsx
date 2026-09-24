import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category || !category.isActive) notFound();

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categories: {
        some: {
          categoryId: category.id,
        },
      },
    },
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

  return (
    <div className="site-container py-10">
      <h1 className="text-3xl font-bold mb-8">{category.name}</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">
          Bu kategoride henüz ürün bulunmuyor.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
