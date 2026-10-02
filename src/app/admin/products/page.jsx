"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus,
  Package,
  Pencil,
  Trash2,
  CircleCheck,
  CircleX,
  Boxes,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);

    fetch("/api/admin/products", {
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {
        toast.error("Ürünler yüklenemedi");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Ürün silindi");
        load();
      } else {
        const data = await res.json().catch(() => null);

        toast.error(
          data?.error || "Ürün silinemedi"
        );
      }
    } catch {
      toast.error("Bir hata oluştu");
    }
  }

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="animate-pulse text-zinc-500">
          Ürünler yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-8">
      {/* Başlık */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            Ürünler
          </h1>

          <p className="mt-1 text-zinc-500">
            Mağazandaki tüm ürünleri buradan yönetebilirsin.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex w-fit shrink-0 items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-zinc-800"
        >
          <Plus size={18} />
          Yeni Ürün
        </Link>
      </div>

      {/* Ürün sayısı kartı */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
            <Boxes size={24} />
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Toplam Ürün
            </p>

            <h2 className="text-3xl font-bold">
              {products.length}
            </h2>
          </div>
        </div>
      </div>

      {/* Tablo */}
      <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {/* 
          MOBİL YATAY SCROLL ALANI
          Tablo ekranı aştığında sadece burası sağa-sola kayar.
        */}
        <div
          className="w-full overflow-x-auto overscroll-x-contain"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
          }}
        >
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="whitespace-nowrap px-6 py-4">
                  Ürün
                </th>

                <th className="whitespace-nowrap px-6 py-4">
                  SKU
                </th>

                <th className="whitespace-nowrap px-6 py-4">
                  Fiyat
                </th>

                <th className="whitespace-nowrap px-6 py-4">
                  Stok
                </th>

                <th className="whitespace-nowrap px-6 py-4">
                  Durum
                </th>

                <th className="whitespace-nowrap px-6 py-4 text-right">
                  İşlemler
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-zinc-100 transition hover:bg-zinc-50"
                >
                  {/* Ürün */}
                  <td className="px-6 py-4">
                    <div className="flex min-w-[280px] items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          p.images?.[0]?.url ||
                          "/uploads/product-placeholder.svg"
                        }
                        alt={p.name}
                        className="h-14 w-14 shrink-0 rounded-xl border border-zinc-200 object-cover"
                      />

                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900">
                          {p.name}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {p.categories?.length
                            ? p.categories
                                .map(
                                  (c) =>
                                    c.category?.name
                                )
                                .filter(Boolean)
                                .join(" • ")
                            : "Kategori yok"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-zinc-600">
                    {p.sku}
                  </td>

                  {/* Fiyat */}
                  <td className="whitespace-nowrap px-6 py-4 font-semibold">
                    {Number(p.price).toFixed(2)} ₺
                  </td>

                  {/* Stok */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        p.stock <= 5
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {p.stock} adet
                    </span>
                  </td>

                  {/* Durum */}
                  <td className="whitespace-nowrap px-6 py-4">
                    {p.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        <CircleCheck size={14} />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700">
                        <CircleX size={14} />
                        Pasif
                      </span>
                    )}
                  </td>

                  {/* İşlemler */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex min-w-max justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="flex shrink-0 items-center gap-1 rounded-xl border border-zinc-200 px-3 py-2 text-zinc-700 transition hover:bg-zinc-100"
                      >
                        <Pencil size={16} />
                        Düzenle
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(p.id)
                        }
                        className="flex shrink-0 items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Boş durum */}
        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <Package
                size={28}
                className="text-zinc-500"
              />
            </div>

            <h3 className="text-lg font-semibold text-zinc-900">
              Henüz ürün bulunmuyor
            </h3>

            <p className="mt-1 text-zinc-500">
              İlk ürününü ekleyerek satışa başlayabilirsin.
            </p>

            <Link
              href="/admin/products/new"
              className="mt-6 flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              <Plus size={18} />
              İlk Ürünü Ekle
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
