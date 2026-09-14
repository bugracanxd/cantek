import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }) {
  const q = searchParams.q || "";
  const products = q
    ? await prisma.product.findMany({
        where: { isActive: true, name: { contains: q, mode: "insensitive" } },
        include: { images: { orderBy: { order: "asc" }, take: 1 } },
      })
    : [];

  return (
    <div className="site-container py-10">
      <form className="mb-8">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Ürün ara..."
          className="w-full max-w-md border px-4 py-3 rounded-site"
        />
      </form>
      {q && (
        <>
          <h1 className="text-xl font-semibold mb-6">&quot;{q}&quot; için {products.length} sonuç</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
