"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.product));
  }, [id]);

  if (!product) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Ürünü Düzenle</h1>
      <ProductForm initial={product} productId={id} />
    </div>
  );
}
