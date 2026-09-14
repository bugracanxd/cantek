"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";

export default function SeoPage() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setSettings(d.draft));
  }, []);

  function update(key, value) {
    setSettings((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings, publish: true }),
    });
    setSaving(false);
    if (!res.ok) return toast.error("Kaydedilemedi");
    toast.success("SEO ayarları yayınlandı");
  }

  if (!settings) return <p>Yükleniyor...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">SEO Ayarları</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm max-w-2xl space-y-4">
        <div>
          <label className="text-sm font-medium">Site Title</label>
          <input className="w-full border rounded-lg px-3 py-2 mt-1" value={settings.seo.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Meta Description</label>
          <textarea rows={3} className="w-full border rounded-lg px-3 py-2 mt-1" value={settings.seo.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Keywords</label>
          <input className="w-full border rounded-lg px-3 py-2 mt-1" value={settings.seo.keywords} onChange={(e) => update("keywords", e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">OG Image</label>
          <ImageUploader images={settings.seo.ogImage} multiple={false} onChange={(url) => update("ogImage", url)} />
        </div>
        <button onClick={save} disabled={saving} className="bg-black text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50">
          {saving ? "Kaydediliyor..." : "Kaydet ve Yayınla"}
        </button>
      </div>
    </div>
  );
}
