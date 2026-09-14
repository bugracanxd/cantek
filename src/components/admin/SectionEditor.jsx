"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import ImageUploader from "./ImageUploader";

export default function SectionEditor({ section, onSaved }) {
  const [title, setTitle] = useState(section.title || "");
  const [data, setData] = useState(JSON.parse(section.data || "{}"));
  const [saving, setSaving] = useState(false);

  function set(key, value) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/homepage-sections/${section.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, data }),
    });
    setSaving(false);
    if (!res.ok) return toast.error("Kaydedilemedi");
    toast.success("Bölüm güncellendi");
    onSaved?.();
  }

  const t = section.type;

  return (
    <div className="space-y-3 max-w-lg">
      <div>
        <label className="text-xs text-gray-500">Bölüm Adı (iç kullanım)</label>
        <input className="w-full border rounded-lg px-3 py-2 mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {(t === "hero" || t === "banner" || t === "brand_story" || t === "category_grid" || t === "product_grid" || t === "instagram" || t === "newsletter" || t === "faq" || t === "video" || t === "text" || t === "logo_strip") && (
        <div>
          <label className="text-xs text-gray-500">Başlık</label>
          <input className="w-full border rounded-lg px-3 py-2 mt-1" value={data.title || ""} onChange={(e) => set("title", e.target.value)} />
        </div>
      )}

      {(t === "hero" || t === "banner" || t === "brand_story") && (
        <div>
          <label className="text-xs text-gray-500">{t === "hero" ? "Alt Başlık" : "Açıklama"}</label>
          <textarea rows={2} className="w-full border rounded-lg px-3 py-2 mt-1"
            value={data.subtitle || data.description || data.text || ""}
            onChange={(e) => set(t === "hero" ? "subtitle" : t === "brand_story" ? "text" : "description", e.target.value)} />
        </div>
      )}

      {(t === "hero" || t === "banner" || t === "brand_story") && (
        <div>
          <label className="text-xs text-gray-500">Görsel</label>
          <ImageUploader images={data.image} multiple={false} onChange={(url) => set("image", url)} />
        </div>
      )}

      {(t === "hero" || t === "banner") && (
        <>
          <div>
            <label className="text-xs text-gray-500">Buton Yazısı</label>
            <input className="w-full border rounded-lg px-3 py-2 mt-1" value={data.buttonText || ""} onChange={(e) => set("buttonText", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Buton Linki</label>
            <input className="w-full border rounded-lg px-3 py-2 mt-1" value={data.buttonLink || ""} onChange={(e) => set("buttonLink", e.target.value)} />
          </div>
        </>
      )}

      {t === "product_grid" && (
        <>
          <div>
            <label className="text-xs text-gray-500">Ürün Filtresi</label>
            <select className="w-full border rounded-lg px-3 py-2 mt-1" value={data.filter || "featured"} onChange={(e) => set("filter", e.target.value)}>
              <option value="featured">Öne Çıkan Ürünler</option>
              <option value="new">Yeni Ürünler</option>
              <option value="bestseller">Çok Satanlar</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Gösterilecek Ürün Sayısı</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 mt-1" value={data.limit || 8} onChange={(e) => set("limit", Number(e.target.value))} />
          </div>
        </>
      )}

      {t === "category_grid" && (
        <div>
          <label className="text-xs text-gray-500">Gösterilecek Kategori Sayısı</label>
          <input type="number" className="w-full border rounded-lg px-3 py-2 mt-1" value={data.limit || 6} onChange={(e) => set("limit", Number(e.target.value))} />
        </div>
      )}

      {t === "newsletter" && (
        <div>
          <label className="text-xs text-gray-500">Açıklama</label>
          <input className="w-full border rounded-lg px-3 py-2 mt-1" value={data.description || ""} onChange={(e) => set("description", e.target.value)} />
        </div>
      )}

      {t === "video" && (
        <div>
          <label className="text-xs text-gray-500">Video URL (embed, örn: YouTube embed linki)</label>
          <input className="w-full border rounded-lg px-3 py-2 mt-1" value={data.videoUrl || ""} onChange={(e) => set("videoUrl", e.target.value)} />
        </div>
      )}

      {t === "text" && (
        <div>
          <label className="text-xs text-gray-500">Metin</label>
          <textarea rows={3} className="w-full border rounded-lg px-3 py-2 mt-1" value={data.text || ""} onChange={(e) => set("text", e.target.value)} />
        </div>
      )}

      <p className="text-xs text-gray-400">
        Gelişmiş alanlar (Instagram görselleri, SSS soruları, özellik listesi, logo listesi) için "Ham JSON"
        alanını kullanabilirsiniz.
      </p>
      <div>
        <label className="text-xs text-gray-500">Ham JSON (ileri düzey)</label>
        <textarea
          rows={4}
          className="w-full border rounded-lg px-3 py-2 mt-1 font-mono text-xs"
          value={JSON.stringify(data, null, 2)}
          onChange={(e) => {
            try {
              setData(JSON.parse(e.target.value));
            } catch {
              // geçersiz JSON, kullanıcı yazmaya devam ediyor - sessizce yoksay
            }
          }}
        />
      </div>

      <button onClick={save} disabled={saving} className="bg-black text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </div>
  );
}
