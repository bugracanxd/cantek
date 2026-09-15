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
      categoryId: "",
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

  // ✅ DÜZELTME: initial sonradan gelince formu güncelle
  useEffect(() => {
    if (initial) {
      setForm({
        ...initial,
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
      images: Array.isArray(form.images)
        ? form.images.filter(Boolean)
        : [],
      price: Number(form.price),
      discountedPrice: form.discountedPrice
        ? Number(form.discountedPrice)
        : null,
      stock: Number(form.stock),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      categoryId: form.categoryId || null,
    };

    const url = productId
      ? `/api/products/${productId}`
      : "/api/products";
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-sm"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Ürün Adı</label>
          <input
            required
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Slug (URL)</label>
          <input
            required
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.slug}
            onChange={(e) =>
              setForm({ ...form, slug: e.target.value })
            }
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
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Fiyat (₺)</label>
          <input
            required
            type="number"
            step="0.01"
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">İndirimli Fiyat</label>
          <input
            type="number"
            step="0.01"
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.discountedPrice || ""}
            onChange={(e) =>
              setForm({
                ...form,
                discountedPrice: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Stok</label>
          <input
            required
            type="number"
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.stock}
            onChange={(e) =>
              setForm({ ...form, stock: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">SKU</label>
          <input
            required
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.sku}
            onChange={(e) =>
              setForm({ ...form, sku: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Kategori</label>
          <select
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.categoryId}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value })
            }
          >
            <option value="">Kategori seçin</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">
            Bedenler (virgülle ayırın)
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.sizes}
            onChange={(e) =>
              setForm({ ...form, sizes: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Renkler (virgülle ayırın)
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.colors}
            onChange={(e) =>
              setForm({ ...form, colors: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Ürün Görselleri</label>
        <div className="mt-1">
          <ImageUploader
            images={form.images}
            onChange={(images) =>
              setForm((prev) => ({ ...prev, images }))
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) =>
              setForm({
                ...form,
                isFeatured: e.target.checked,
              })
            }
          />
          Öne Çıkan
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(e) =>
              setForm({ ...form, isNew: e.target.checked })
            }
          />
          Yeni Ürün
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isBestSeller}
            onChange={(e) =>
              setForm({
                ...form,
                isBestSeller: e.target.checked,
              })
            }
          />
          Çok Satan
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm({ ...form, isActive: e.target.checked })
            }
          />
          Aktif
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">SEO Başlık</label>
          <input
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.seoTitle}
            onChange={(e) =>
              setForm({ ...form, seoTitle: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">SEO Açıklama</label>
          <input
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={form.seoDescription}
            onChange={(e) =>
              setForm({
                ...form,
                seoDescription: e.target.value,
              })
            }
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
