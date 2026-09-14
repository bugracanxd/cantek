"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";

const TABS = ["general", "header", "footer"];
const TAB_LABELS = { general: "Genel", header: "Header", footer: "Footer" };

export default function ThemePage() {
  const [settings, setSettings] = useState(null);
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setSettings(d.draft));
  }
  useEffect(load, []);

  function update(section, key, value) {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  }

  async function save(publish) {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings, publish }),
    });
    setSaving(false);
    if (!res.ok) return toast.error("Kaydedilemedi");
    toast.success(publish ? "Yayınlandı! Site şimdi güncel." : "Taslak kaydedildi (önizleme için)");
  }

  if (!settings) return <p>Yükleniyor...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Site Tasarımı</h1>
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={saving} className="border px-4 py-2 rounded-lg text-sm">
            Taslağı Kaydet
          </button>
          <button onClick={() => save(true)} disabled={saving} className="bg-black text-white px-4 py-2 rounded-lg text-sm">
            Yayınla
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm ${tab === t ? "bg-black text-white" : "bg-white border"}`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm max-w-2xl space-y-4">
        {tab === "general" && (
          <>
            <Field label="Site Adı">
              <input className="input" value={settings.general.siteName} onChange={(e) => update("general", "siteName", e.target.value)} />
            </Field>
            <Field label="Site Açıklaması">
              <input className="input" value={settings.general.siteDescription} onChange={(e) => update("general", "siteDescription", e.target.value)} />
            </Field>
            <Field label="Logo">
              <ImageUploader images={settings.general.logo} multiple={false} onChange={(url) => update("general", "logo", url)} />
            </Field>
            <Field label="Favicon">
              <ImageUploader images={settings.general.favicon} multiple={false} onChange={(url) => update("general", "favicon", url)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <ColorField label="Ana Renk" value={settings.general.primaryColor} onChange={(v) => update("general", "primaryColor", v)} />
              <ColorField label="İkincil Renk" value={settings.general.secondaryColor} onChange={(v) => update("general", "secondaryColor", v)} />
              <ColorField label="Buton Rengi" value={settings.general.buttonColor} onChange={(v) => update("general", "buttonColor", v)} />
              <ColorField label="Buton Yazı Rengi" value={settings.general.buttonTextColor} onChange={(v) => update("general", "buttonTextColor", v)} />
              <ColorField label="Yazı Rengi" value={settings.general.textColor} onChange={(v) => update("general", "textColor", v)} />
              <ColorField label="Arka Plan Rengi" value={settings.general.backgroundColor} onChange={(v) => update("general", "backgroundColor", v)} />
            </div>
            <Field label="Gövde Yazı Fontu (metinler, butonlar)">
              <select className="input" value={settings.general.fontFamily} onChange={(e) => update("general", "fontFamily", e.target.value)}>
                <option value="'Poppins', sans-serif">Poppins (şık, modern)</option>
                <option value="'Inter', sans-serif">Inter</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
              </select>
            </Field>
            <Field label="Başlık Fontu (h1/h2 başlıklar)">
              <select className="input" value={settings.general.headingFontFamily || "'Playfair Display', serif"} onChange={(e) => update("general", "headingFontFamily", e.target.value)}>
                <option value="'Playfair Display', serif">Playfair Display (premium serif)</option>
                <option value="'Cormorant Garamond', serif">Cormorant Garamond (zarif)</option>
                <option value="'Marcellus', serif">Marcellus (lüks)</option>
                <option value="'Poppins', sans-serif">Poppins (modern sans)</option>
              </select>
            </Field>
            <Field label="Border Radius">
              <input className="input" value={settings.general.borderRadius} onChange={(e) => update("general", "borderRadius", e.target.value)} placeholder="6px" />
            </Field>
            <Field label="Site Genişliği">
              <input className="input" value={settings.general.siteWidth} onChange={(e) => update("general", "siteWidth", e.target.value)} placeholder="1280px" />
            </Field>
          </>
        )}

        {tab === "header" && (
          <>
            <Field label="Header Yüksekliği">
              <input className="input" value={settings.header.height} onChange={(e) => update("header", "height", e.target.value)} />
            </Field>
            <ColorField label="Arka Plan" value={settings.header.backgroundColor} onChange={(v) => update("header", "backgroundColor", v)} />
            <ColorField label="Yazı Rengi" value={settings.header.textColor} onChange={(v) => update("header", "textColor", v)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.header.showSearch} onChange={(e) => update("header", "showSearch", e.target.checked)} />
              Arama butonu göster
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.header.showAccount} onChange={(e) => update("header", "showAccount", e.target.checked)} />
              Hesap butonu göster
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.header.showCart} onChange={(e) => update("header", "showCart", e.target.checked)} />
              Sepet butonu göster
            </label>
            <p className="text-xs text-gray-500">Menü öğelerini "Menüler" sekmesinden yönetebilirsiniz.</p>
          </>
        )}

        {tab === "footer" && (
          <>
            <Field label="Hakkımızda Metni">
              <textarea rows={3} className="input" value={settings.footer.aboutText} onChange={(e) => update("footer", "aboutText", e.target.value)} />
            </Field>
            <Field label="Telefon"><input className="input" value={settings.footer.phone} onChange={(e) => update("footer", "phone", e.target.value)} /></Field>
            <Field label="E-posta"><input className="input" value={settings.footer.email} onChange={(e) => update("footer", "email", e.target.value)} /></Field>
            <Field label="Adres"><input className="input" value={settings.footer.address} onChange={(e) => update("footer", "address", e.target.value)} /></Field>
            <Field label="Instagram"><input className="input" value={settings.footer.instagram} onChange={(e) => update("footer", "instagram", e.target.value)} /></Field>
            <Field label="Facebook"><input className="input" value={settings.footer.facebook} onChange={(e) => update("footer", "facebook", e.target.value)} /></Field>
            <Field label="TikTok"><input className="input" value={settings.footer.tiktok} onChange={(e) => update("footer", "tiktok", e.target.value)} /></Field>
            <Field label="WhatsApp Linki"><input className="input" value={settings.footer.whatsapp} onChange={(e) => update("footer", "whatsapp", e.target.value)} /></Field>
            <Field label="Telif Hakkı Yazısı"><input className="input" value={settings.footer.copyrightText} onChange={(e) => update("footer", "copyrightText", e.target.value)} /></Field>
          </>
        )}
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-medium block">{label}</label>
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium block">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 border rounded" />
        <input className="input flex-1" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
