"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUploader from "./ImageUploader";

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  discountedPrice: "",
  sku: "",
  stock: 0,
  sizes: "40,41,42,43,44",
  colors: "Siyah,Kahverengi",
  categoryId: "",
  images: [],
  isFeatured: false,
  isNew: false,
  isBestSeller: false,
  isActive: true,
  seoTitle: "",
  seoDescription: "",
};

export default function ProductForm({ initial, productId }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  // EN KRİTİK DÜZELTME
  useEffect(() => {
    if (initial) {
      setForm({
        ...defaultForm,
        ...initial,
        images: Array.isArray(initial.images) ? initial.images : [],
      });
    }
  }, [initial]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      images: (form.images || []).filter(Boolean),
      price: Number(form.price),
      discountedPrice: form.discountedPrice
        ? Number(form.discountedPrice)
        : null,
      stock: Number(form.stock),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      categoryId: form.categoryId || null,
    };

    const url = productId ? `/api/products/${productId}` : "/api/products";
    const method = productId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Ürün Adı</label>
          <input
            required
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Slug (URL)</label>
          <input
            required
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Açıklama</label>
        <textarea
          required
          rows={4}
          className="w-full border rounded-lg px-3 py-2 mt-1"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Fiyat</label>
          <input
            type="number"
            step="0.01"
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">İndirimli Fiyat</label>
          <input
            type="number"
            step="0.01"
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.discountedPrice}
            onChange={(e) =>
              setForm({ ...form, discountedPrice: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Stok</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Ürün Görselleri</label>
        <div className="mt-1">
          <ImageUploader
            images={form.images}
            onChange={(images) => setForm((prev) => ({ ...prev, images }))}
          />
        </div>
      </div>

      <button
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
