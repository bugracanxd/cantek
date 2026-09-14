"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", slug: "", image: "" });

  function load() {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error);
    toast.success("Kategori eklendi");
    setForm({ name: "", slug: "", image: "" });
    load();
  }

  async function toggleActive(cat) {
    await fetch(`/api/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Silinsin mi?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kategoriler</h1>

      <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-sm mb-8 max-w-md space-y-3">
        <h2 className="font-semibold">Yeni Kategori</h2>
        <input required placeholder="Ad" className="w-full border rounded-lg px-3 py-2" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required placeholder="slug (örn: klasik-ayakkabi)" className="w-full border rounded-lg px-3 py-2" value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <ImageUploader images={form.image} multiple={false} onChange={(url) => setForm({ ...form, image: url })} />
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">Ekle</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="p-3"></th><th className="p-3">Ad</th><th className="p-3">Durum</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image || "/uploads/category-placeholder.svg"} alt="" className="w-10 h-10 object-cover rounded" />
                </td>
                <td className="p-3">{c.name}</td>
                <td className="p-3">
                  <button onClick={() => toggleActive(c)} className={c.isActive ? "text-green-600" : "text-gray-400"}>
                    {c.isActive ? "Aktif" : "Pasif"}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(c.id)} className="text-red-600">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
