"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  FolderTree,
  Plus,
  Search,
  Trash2,
  Power,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Layers3,
  Tag,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    image: "",
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  function load() {
    setLoading(true);

    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {
        toast.error("Kategoriler yüklenemedi");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Kategori adı ve slug zorunlu");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Kategori eklenemedi");
        return;
      }

      toast.success("Kategori eklendi");

      setForm({
        name: "",
        slug: "",
        image: "",
      });

      load();
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(cat) {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !cat.isActive,
        }),
      });

      if (!res.ok) {
        toast.error("Kategori durumu değiştirilemedi");
        return;
      }

      toast.success(
        cat.isActive ? "Kategori pasif yapıldı" : "Kategori aktif yapıldı"
      );

      load();
    } catch {
      toast.error("Bir hata oluştu");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Bu kategori silinsin mi?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Kategori silinemedi");
        return;
      }

      toast.success("Kategori silindi");
      load();
    } catch {
      toast.error("Bir hata oluştu");
    }
  }

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(query) ||
        category.slug?.toLowerCase().includes(query)
    );
  }, [categories, search]);

  const activeCount = categories.filter((c) => c.isActive).length;
  const passiveCount = categories.filter((c) => !c.isActive).length;

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <FolderTree className="h-4 w-4" />
              <span>Yönetim</span>
              <span>/</span>
              <span className="text-gray-900">Kategoriler</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              Kategoriler
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Mağazandaki ürün kategorilerini yönet.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Toplam Kategori
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  {categories.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <Layers3 className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Aktif Kategori
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  {activeCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pasif Kategori
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  {passiveCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <XCircle className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          {/* Create Category */}
          <div className="h-fit rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <Plus className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-950">
                    Yeni Kategori
                  </h2>
                  <p className="text-xs text-gray-500">
                    Mağazana yeni kategori ekle
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Kategori Adı
                </label>

                <div className="relative">
                  <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    required
                    placeholder="Örn. Klasik Ayakkabı"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Slug
                </label>

                <input
                  required
                  placeholder="klasik-ayakkabi"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                />

                <p className="mt-2 text-xs text-gray-400">
                  URL içerisinde kullanılacak kategori adı.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Kategori Görseli
                </label>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <ImageUploader
                    images={form.image}
                    multiple={false}
                    onChange={(url) =>
                      setForm({
                        ...form,
                        image: url,
                      })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {creating ? "Ekleniyor..." : "Kategori Ekle"}
              </button>
            </form>
          </div>

          {/* Categories */}
          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-gray-950">
                  Kategori Listesi
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {filteredCategories.length} kategori gösteriliyor
                </p>
              </div>

              <div className="relative w-full md:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  placeholder="Kategori ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                    <th className="px-6 py-4 font-medium text-gray-500">
                      Görsel
                    </th>
                    <th className="px-6 py-4 font-medium text-gray-500">
                      Kategori
                    </th>
                    <th className="px-6 py-4 font-medium text-gray-500">
                      Slug
                    </th>
                    <th className="px-6 py-4 font-medium text-gray-500">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-right font-medium text-gray-500">
                      İşlem
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-100" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="ml-auto h-9 w-9 animate-pulse rounded-lg bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                          <FolderTree className="h-6 w-6 text-gray-400" />
                        </div>

                        <p className="mt-4 font-medium text-gray-900">
                          Kategori bulunamadı
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {search
                            ? "Arama kriterlerini değiştirmeyi deneyin."
                            : "Henüz kategori eklenmemiş."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50/70 last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                c.image ||
                                "/uploads/category-placeholder.svg"
                              }
                              alt={c.name || ""}
                              className="h-full w-full object-cover"
                            />

                            {!c.image && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {c.name}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-600">
                            /{c.slug}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => toggleActive(c)}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              c.isActive
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                c.isActive
                                  ? "bg-emerald-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            {c.isActive ? "Aktif" : "Pasif"}
                          </button>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Kategoriyi sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-gray-100 md:hidden">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 animate-pulse rounded-xl bg-gray-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredCategories.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                    <FolderTree className="h-6 w-6 text-gray-400" />
                  </div>

                  <p className="mt-4 font-medium text-gray-900">
                    Kategori bulunamadı
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {search
                      ? "Arama kriterlerini değiştirmeyi deneyin."
                      : "Henüz kategori eklenmemiş."}
                  </p>
                </div>
              ) : (
                filteredCategories.map((c) => (
                  <div key={c.id} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            c.image ||
                            "/uploads/category-placeholder.svg"
                          }
                          alt={c.name || ""}
                          className="h-full w-full object-cover"
                        />

                        {!c.image && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {c.name}
                            </p>

                            <p className="mt-1 truncate font-mono text-xs text-gray-400">
                              /{c.slug}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Kategoriyi sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleActive(c)}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              c.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                c.isActive
                                  ? "bg-emerald-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            {c.isActive ? "Aktif" : "Pasif"}
                          </button>

                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Power className="h-3.5 w-3.5" />
                            Durum
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
