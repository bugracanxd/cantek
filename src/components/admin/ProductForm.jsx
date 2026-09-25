"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUploader from "./ImageUploader";

export default function ProductForm({ initial, productId }) {
  const router = useRouter();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState(
    initial || {
      name: "",
      slug: "",
      description: "",
      price: 0,
      discountedPrice: "",
      sku: "",
      stock: 0,
      sizes: "40,41,42,43,44",
      colors: "Siyah,Kahverengi",
      categoryIds: [],
      images: [],
      isFeatured: false,
      isNew: false,
      isBestSeller: false,
      isActive: true,
      seoTitle: "",
      seoDescription: "",
    }
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    if (initial) {
      setForm({
        ...initial,
        categoryIds: initial.categories
          ? initial.categories.map((c) => c.category.id)
          : [],
        images: Array.isArray(initial.images)
          ? initial.images
          : initial.images
          ? [initial.images]
          : [],
      });
    }
  }, [initial]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,

      // 🔥 DÜZELTİLEN KISIM
      images: Array.isArray(form.images)
        ? form.images
            .map((img) => (typeof img === "string" ? img : img?.url))
            .filter(Boolean)
        : [],

      price: Number(form.price),
      discountedPrice: form.discountedPrice
        ? Number(form.discountedPrice)
        : null,
      stock: Number(form.stock),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      categoryIds: form.categoryIds,
    };

    const url = productId
      ? `/api/products/${productId}`
      : "/api/products";

    const method = productId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Bir hata oluştu");
      return;
    }

    toast.success("Kaydedildi");
    router.push("/admin/products");
    router.refresh();
  }

  const toggleCategory = (id) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-2xl rounded-xl bg-white p-6 shadow-sm"
    >
      {/* DOSYANIN GERİ KALANI AYNI KALIYOR */}
      {/* Hiçbir UI değişmedi, sadece images payload düzeltildi */}
    </form>
  );
}
