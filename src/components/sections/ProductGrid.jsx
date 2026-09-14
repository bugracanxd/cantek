import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export default async function ProductGridSection({ data }) {
  const filter = data.filter || "featured";
  const where = { isActive: true };

  if (filter === "featured") where.isFeatured = true;
  if (filter === "new") where.isNew = true;
  if (filter === "bestseller") where.isBestSeller = true;

  const products = await prisma.product.findMany({
    where,
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
    },
    orderBy: { order: "asc" },
    take: data.limit || 8,
  });

  if (!products.length) return null;

  return (
    <section className="bg-[#FAF8F4] py-20">
      <div className="site-container">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
              CANTEK COLLECTION
            </p>

            <h2 className="mt-3 font-heading text-3xl font-bold md:text-4xl">
              {data.title || "Seçkin Modeller"}
            </h2>

            <p className="mt-3 max-w-xl text-neutral-600">
              Hakiki deri, zamansız tasarım ve üstün işçilikle hazırlanan
              premium erkek ayakkabı koleksiyonumuzu keşfedin.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}