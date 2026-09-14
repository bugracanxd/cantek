"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MenusPage() {
  const [menus, setMenus] = useState([]);
  const [location, setLocation] = useState("header");
  const [form, setForm] = useState({ label: "", url: "" });

  function load() {
    fetch("/api/admin/menus").then((r) => r.json()).then((d) => setMenus(d.menus || []));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, location }),
    });
    if (!res.ok) return toast.error("Eklenemedi");
    setForm({ label: "", url: "" });
    load();
  }

  async function handleDelete(id) {
    await fetch(`/api/admin/menus/${id}`, { method: "DELETE" });
    load();
  }

  async function move(menu, direction) {
    const list = menus.filter((m) => m.location === menu.location).sort((a, b) => a.order - b.order);
    const idx = list.findIndex((m) => m.id === menu.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const other = list[swapIdx];
    await Promise.all([
      fetch(`/api/admin/menus/${menu.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: other.order }) }),
      fetch(`/api/admin/menus/${other.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: menu.order }) }),
    ]);
    load();
  }

  const filtered = menus.filter((m) => m.location === location).sort((a, b) => a.order - b.order);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Menüler</h1>

      <div className="flex gap-2 mb-6">
        {["header", "footer"].map((loc) => (
          <button key={loc} onClick={() => setLocation(loc)} className={`px-4 py-2 rounded-lg text-sm ${location === loc ? "bg-black text-white" : "bg-white border"}`}>
            {loc === "header" ? "Header Menüsü" : "Footer Menüsü"}
          </button>
        ))}
      </div>

      <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-sm mb-6 max-w-md space-y-3">
        <input required placeholder="Menü adı (örn: Erkek)" className="w-full border rounded-lg px-3 py-2" value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })} />
        <input required placeholder="Link (örn: /category/erkek)" className="w-full border rounded-lg px-3 py-2" value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">Ekle</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm divide-y">
        {filtered.map((m) => (
          <div key={m.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">{m.label}</div>
              <div className="text-xs text-gray-500">{m.url}</div>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => move(m, "up")}>↑</button>
              <button onClick={() => move(m, "down")}>↓</button>
              <button onClick={() => handleDelete(m.id)} className="text-red-600">Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
