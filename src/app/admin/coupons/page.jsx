"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", type: "PERCENT", value: 10, minCartAmount: 0, usageLimit: "" });

  function load() {
    fetch("/api/coupons").then((r) => r.json()).then((d) => setCoupons(d.coupons || []));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        value: Number(form.value),
        minCartAmount: Number(form.minCartAmount || 0),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error);
    toast.success("Kupon oluşturuldu");
    setForm({ code: "", type: "PERCENT", value: 10, minCartAmount: 0, usageLimit: "" });
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Silinsin mi?")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kuponlar</h1>

      <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-sm mb-8 max-w-md space-y-3">
        <h2 className="font-semibold">Yeni Kupon</h2>
        <input required placeholder="Kod (örn: HOSGELDIN10)" className="w-full border rounded-lg px-3 py-2" value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select className="w-full border rounded-lg px-3 py-2" value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="PERCENT">Yüzde İndirim (%)</option>
          <option value="FIXED">Sabit İndirim (₺)</option>
        </select>
        <input required type="number" placeholder="Değer" className="w-full border rounded-lg px-3 py-2" value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })} />
        <input type="number" placeholder="Minimum sepet tutarı" className="w-full border rounded-lg px-3 py-2" value={form.minCartAmount}
          onChange={(e) => setForm({ ...form, minCartAmount: e.target.value })} />
        <input type="number" placeholder="Kullanım limiti (opsiyonel)" className="w-full border rounded-lg px-3 py-2" value={form.usageLimit}
          onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">Oluştur</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="p-3">Kod</th><th className="p-3">Tip</th><th className="p-3">Değer</th><th className="p-3">Kullanım</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.code}</td>
                <td className="p-3">{c.type === "PERCENT" ? "%" : "₺"}</td>
                <td className="p-3">{c.value}</td>
                <td className="p-3">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
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
