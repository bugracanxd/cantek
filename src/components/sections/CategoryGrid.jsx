import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CategoryGridSection({ data }) {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    take: data.limit || 6,
  });

  if (categories.length === 0) return null;

    return (
    <section className="bg-[#F8F7F4] py-20">
      <div className="site-container">

        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
            CANTEK COLLECTIONS
          </p>

          <h2 className="mt-3 font-heading text-3xl md:text-5xl font-bold">
            Zamansız Koleksiyonlar
          </h2>

          <p className="mt-4 max-w-xl text-neutral-600 text-lg">
            Hakiki deri ve üstün işçilikle hazırlanan koleksiyonlarımızı keşfedin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group relative overflow-hidden rounded-[32px] aspect-[4/5] bg-[#F4F1EA]"
            >
              <img
                src={c.image || "/uploads/category-placeholder.svg"}
                alt={c.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
                  CANTEK
                </p>

                <h3 className="mt-2 text-3xl font-heading font-bold text-white">
                  {c.name}
                </h3>

                <p className="mt-3 text-white/80 text-sm">
                  Koleksiyonu Keşfet →
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}