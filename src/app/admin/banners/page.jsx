"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", desktopImage: "", mobileImage: "", buttonText: "", buttonLink: "" });

  function load() {
    fetch("/api/admin/banners").then((r) => r.json()).then((d) => setBanners(d.banners || []));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.desktopImage) return toast.error("Masaüstü görseli zorunlu");
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return toast.error("Eklenemedi");
    toast.success("Banner eklendi");
    setForm({ title: "", description: "", desktopImage: "", mobileImage: "", buttonText: "", buttonLink: "" });
    load();
  }

  async function toggleActive(b) {
    await fetch(`/api/admin/banners/${b.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !b.isActive }),
    });
    load();
  }

  async function handleDelete(id) {
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bannerlar</h1>
      <p className="text-sm text-gray-500 mb-4">
        Bu bannerları Ana Sayfa bölümlerinde "Banner" tipi bir section eklerken görsel kaynağı olarak kullanabilirsiniz.
      </p>

      <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-sm mb-8 max-w-md space-y-3">
        <h2 className="font-semibold">Yeni Banner</h2>
        <input placeholder="Başlık" className="w-full border rounded-lg px-3 py-2" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Açıklama" className="w-full border rounded-lg px-3 py-2" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div>
          <label className="text-xs text-gray-500">Masaüstü Görseli</label>
          <ImageUploader images={form.desktopImage} multiple={false} onChange={(url) => setForm({ ...form, desktopImage: url })} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Mobil Görseli (opsiyonel)</label>
          <ImageUploader images={form.mobileImage} multiple={false} onChange={(url) => setForm({ ...form, mobileImage: url })} />
        </div>
        <input placeholder="Buton Yazısı" className="w-full border rounded-lg px-3 py-2" value={form.buttonText}
          onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
        <input placeholder="Buton Linki" className="w-full border rounded-lg px-3 py-2" value={form.buttonLink}
          onChange={(e) => setForm({ ...form, buttonLink: e.target.value })} />
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">Ekle</button>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.desktopImage} alt={b.title} className="w-full h-32 object-cover" />
            <div className="p-4">
              <div className="font-medium">{b.title}</div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <button onClick={() => toggleActive(b)} className={b.isActive ? "text-green-600" : "text-gray-400"}>
                  {b.isActive ? "Aktif" : "Pasif"}
                </button>
                <button onClick={() => handleDelete(b.id)} className="text-red-600">Sil</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
