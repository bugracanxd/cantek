"use client";

import { useEffect, useState } from "react";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage({ params }) {
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.product;
        setInitial({
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          discountedPrice: p.discountedPrice || "",
          sku: p.sku,
          stock: p.stock,
          sizes: JSON.parse(p.sizes || "[]").join(","),
          colors: JSON.parse(p.colors || "[]").join(","),
          categoryId: p.categoryId || "",
          images: p.images.map((i) => i.url),
          isFeatured: p.isFeatured,
          isNew: p.isNew,
          isBestSeller: p.isBestSeller,
          isActive: p.isActive,
          seoTitle: p.seoTitle || "",
          seoDescription: p.seoDescription || "",
        });
      });
  }, [params.id]);

  if (!initial) return <p>Yükleniyor...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ürünü Düzenle</h1>
      <ProductForm initial={initial} productId={params.id} />
    </div>
  );
}
