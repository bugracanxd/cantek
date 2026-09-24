"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  TicketPercent,
  Plus,
  Search,
  Trash2,
  Tag,
  Percent,
  Banknote,
  Users,
  ShoppingCart,
  Ticket,
  TrendingUp,
} from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT",
    value: 10,
    minCartAmount: 0,
    usageLimit: "",
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  function load() {
    setLoading(true);

    fetch("/api/coupons")
      .then((r) => r.json())
      .then((d) => setCoupons(d.coupons || []))
      .catch(() => {
        toast.error("Kuponlar yüklenemedi");
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

    if (!form.code.trim()) {
      toast.error("Kupon kodu girin");
      return;
    }

    if (Number(form.value) <= 0) {
      toast.error("İndirim değeri 0'dan büyük olmalı");
      return;
    }

    if (form.type === "PERCENT" && Number(form.value) > 100) {
      toast.error("Yüzde indirim 100'den büyük olamaz");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          code: form.code.trim().toUpperCase(),
          value: Number(form.value),
          minCartAmount: Number(form.minCartAmount || 0),
          usageLimit: form.usageLimit
            ? Number(form.usageLimit)
            : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Kupon oluşturulamadı");
        return;
      }

      toast.success("Kupon oluşturuldu");

      setForm({
        code: "",
        type: "PERCENT",
        value: 10,
        minCartAmount: 0,
        usageLimit: "",
      });

      load();
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Bu kupon silinsin mi?")) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Kupon silinemedi");
        return;
      }

      toast.success("Kupon silindi");
      load();
    } catch {
      toast.error("Bir hata oluştu");
    }
  }

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return coupons;

    return coupons.filter((coupon) =>
      coupon.code?.toLowerCase().includes(query)
    );
  }, [coupons, search]);

  const totalUsage = coupons.reduce(
    (total, coupon) => total + Number(coupon.usedCount || 0),
    0
  );

  const limitedCoupons = coupons.filter(
    (coupon) => coupon.usageLimit
  ).length;

  const unlimitedCoupons = coupons.filter(
    (coupon) => !coupon.usageLimit
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <TicketPercent className="h-4 w-4" />
            <span>Yönetim</span>
            <span>/</span>
            <span className="text-gray-900">Kuponlar</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            Kuponlar
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            İndirim kuponlarını oluştur ve kullanım durumlarını takip et.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Toplam Kupon
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  {coupons.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <Ticket className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Toplam Kullanım
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  {totalUsage}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Limitli Kupon
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  {limitedCoupons}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Limitsiz Kupon
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                  {unlimitedCoupons}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <TicketPercent className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          {/* Create Coupon */}
          <div className="h-fit rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <Plus className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-950">
                    Yeni Kupon
                  </h2>

                  <p className="text-xs text-gray-500">
                    Yeni bir indirim kuponu oluştur
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-5 p-6">
              {/* Code */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Kupon Kodu
                </label>

                <div className="relative">
                  <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    required
                    placeholder="HOSGELDIN10"
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm font-medium uppercase outline-none transition placeholder:normal-case placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  İndirim Tipi
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        type: "PERCENT",
                      })
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                      form.type === "PERCENT"
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Percent className="h-4 w-4" />
                    Yüzde
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        type: "FIXED",
                      })
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                      form.type === "FIXED"
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Banknote className="h-4 w-4" />
                    Sabit
                  </button>
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  İndirim Değeri
                </label>

                <div className="relative">
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.value}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        value: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 pr-12 text-sm outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                    {form.type === "PERCENT" ? "%" : "₺"}
                  </span>
                </div>
              </div>

              {/* Minimum Cart */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Minimum Sepet Tutarı
                </label>

                <div className="relative">
                  <ShoppingCart className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={form.minCartAmount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        minCartAmount: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                    ₺
                  </span>
                </div>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Kullanım Limiti
                </label>

                <div className="relative">
                  <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="number"
                    min="1"
                    placeholder="Limitsiz"
                    value={form.usageLimit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        usageLimit: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Boş bırakırsan kullanım limiti olmaz.
                </p>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {creating ? "Oluşturuluyor..." : "Kupon Oluştur"}
              </button>
            </form>
          </div>

          {/* Coupon List */}
          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-gray-950">
                  Kupon Listesi
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {filteredCoupons.length} kupon gösteriliyor
                </p>
              </div>

              <div className="relative w-full md:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  placeholder="Kupon ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                    <th className="px-6 py-4 font-medium text-gray-500">
                      Kupon
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Tip
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      İndirim
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Min. Sepet
                    </th>

                    <th className="px-6 py-4 font-medium text-gray-500">
                      Kullanım
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
                        <td className="px-6 py-5">
                          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                        </td>

                        <td className="px-6 py-5">
                          <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />
                        </td>

                        <td className="px-6 py-5">
                          <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                        </td>

                        <td className="px-6 py-5">
                          <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                        </td>

                        <td className="px-6 py-5">
                          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                        </td>

                        <td className="px-6 py-5">
                          <div className="ml-auto h-9 w-9 animate-pulse rounded-lg bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  ) : filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                          <TicketPercent className="h-6 w-6 text-gray-400" />
                        </div>

                        <p className="mt-4 font-medium text-gray-900">
                          Kupon bulunamadı
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {search
                            ? "Arama kriterlerini değiştirmeyi deneyin."
                            : "Henüz kupon oluşturulmamış."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50/70 last:border-0"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                              <Ticket className="h-4 w-4 text-gray-600" />
                            </div>

                            <div>
                              <p className="font-bold tracking-wide text-gray-900">
                                {c.code}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-400">
                                İndirim kuponu
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              c.type === "PERCENT"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {c.type === "PERCENT" ? (
                              <Percent className="h-3.5 w-3.5" />
                            ) : (
                              <Banknote className="h-3.5 w-3.5" />
                            )}

                            {c.type === "PERCENT" ? "Yüzde" : "Sabit"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="font-semibold text-gray-900">
                            {c.value}
                            {c.type === "PERCENT" ? "%" : " ₺"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-gray-600">
                            {Number(c.minCartAmount || 0).toLocaleString(
                              "tr-TR"
                            )}{" "}
                            ₺
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {c.usedCount || 0}
                            </span>

                            {c.usageLimit ? (
                              <>
                                <span className="text-gray-300">/</span>

                                <span className="text-gray-500">
                                  {c.usageLimit}
                                </span>
                              </>
                            ) : (
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500">
                                Limitsiz
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Kuponu sil"
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

            {/* Mobile */}
            <div className="divide-y divide-gray-100 md:hidden">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-100" />

                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredCoupons.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                    <TicketPercent className="h-6 w-6 text-gray-400" />
                  </div>

                  <p className="mt-4 font-medium text-gray-900">
                    Kupon bulunamadı
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {search
                      ? "Arama kriterlerini değiştirmeyi deneyin."
                      : "Henüz kupon oluşturulmamış."}
                  </p>
                </div>
              ) : (
                filteredCoupons.map((c) => (
                  <div key={c.id} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <Ticket className="h-4 w-4 text-gray-600" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold tracking-wide text-gray-900">
                              {c.code}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              İndirim kuponu
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Kuponu sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-[11px] font-medium text-gray-400">
                              İndirim
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                              {c.value}
                              {c.type === "PERCENT" ? "%" : " ₺"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-[11px] font-medium text-gray-400">
                              Kullanım
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                              {c.usedCount || 0}
                              {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                            </p>
                          </div>

                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-[11px] font-medium text-gray-400">
                              Tip
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                              {c.type === "PERCENT" ? "Yüzde" : "Sabit"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-[11px] font-medium text-gray-400">
                              Min. Sepet
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                              {Number(
                                c.minCartAmount || 0
                              ).toLocaleString("tr-TR")}{" "}
                              ₺
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              c.type === "PERCENT"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {c.type === "PERCENT" ? (
                              <Percent className="h-3.5 w-3.5" />
                            ) : (
                              <Banknote className="h-3.5 w-3.5" />
                            )}

                            {c.type === "PERCENT"
                              ? "Yüzde İndirim"
                              : "Sabit İndirim"}
                          </span>
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
