"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Ürün silindi");
      load();
    } else {
      toast.error("Silinemedi");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ürünler</h1>
        <Link href="/admin/products/new" className="bg-black text-white px-4 py-2 rounded-lg text-sm">
          + Yeni Ürün
        </Link>
      </div>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3"></th>
                <th className="p-3">Ad</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Fiyat</th>
                <th className="p-3">Stok</th>
                <th className="p-3">Durum</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images?.[0]?.url || "/uploads/product-placeholder.svg"} alt="" className="w-10 h-10 object-cover rounded" />
                  </td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.sku}</td>
                  <td className="p-3">{p.price.toFixed(2)} ₺</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">{p.isActive ? "Aktif" : "Pasif"}</td>
                  <td className="p-3 text-right space-x-2">
                    <Link href={`/admin/products/${p.id}`} className="text-blue-600">Düzenle</Link>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600">Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
