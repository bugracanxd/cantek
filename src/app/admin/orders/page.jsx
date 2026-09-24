"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  RotateCcw,
  CreditCard,
  PackageCheck,
} from "lucide-react";
const STATUS_LABELS = {
  PAYMENT_PENDING: "Ödeme Bekliyor",
  PAID: "Ödendi",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya Verildi",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  RETURNED: "İade Edildi",
};
const STATUS_STYLES = {
  PAYMENT_PENDING:
    "bg-amber-50 text-amber-700 border-amber-200",
  PAID:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  PREPARING:
    "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED:
    "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED:
    "bg-red-50 text-red-700 border-red-200",
  RETURNED:
    "bg-orange-50 text-orange-700 border-orange-200",
};
const STATUS_ICONS = {
  PAYMENT_PENDING: Clock3,
  PAID: CreditCard,
  PREPARING: PackageCheck,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
  RETURNED: RotateCcw,
};
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchValue = search.toLowerCase().trim();
      const matchesSearch =
        !searchValue ||
        order.orderNumber?.toLowerCase().includes(searchValue) ||
        order.customerName?.toLowerCase().includes(searchValue);
      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(
      (o) => o.status === "PAYMENT_PENDING"
    ).length;
    const preparing = orders.filter(
      (o) => o.status === "PREPARING"
    ).length;
    const shipped = orders.filter(
      (o) => o.status === "SHIPPED"
    ).length;
    const delivered = orders.filter(
      (o) => o.status === "DELIVERED"
    ).length;
    return {
      total,
      pending,
      preparing,
      shipped,
      delivered,
    };
  }, [orders]);
  function formatPrice(value) {
    return Number(value || 0).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  function formatDate(value) {
    return new Date(value).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  function StatusBadge({ status }) {
    const Icon = STATUS_ICONS[status] || Clock3;
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
          STATUS_STYLES[status] ||
          "bg-gray-50 text-gray-700 border-gray-200"
        }`}
      >
        <Icon size={13} strokeWidth={2} />
        {STATUS_LABELS[status] || status}
      </span>
    );
  }
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <ShoppingBag size={16} />
              <span>Admin Panel</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-700">Siparişler</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
              Siparişler
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Mağazanızdaki tüm siparişleri buradan yönetin.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
            <ShoppingBag size={17} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {orders.length} sipariş
            </span>
          </div>
        </div>
        {/* STAT CARDS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Toplam Sipariş"
            value={stats.total}
            icon={ShoppingBag}
          />
          <StatCard
            title="Ödeme Bekliyor"
            value={stats.pending}
            icon={Clock3}
          />
          <StatCard
            title="Hazırlanıyor"
            value={stats.preparing}
            icon={PackageCheck}
          />
          <StatCard
            title="Kargoda"
            value={stats.shipped}
            icon={Truck}
          />
          <StatCard
            title="Teslim Edildi"
            value={stats.delivered}
            icon={CheckCircle2}
          />
        </div>
        {/* MAIN CARD */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* TOOLBAR */}
          <div className="border-b border-gray-100 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* SEARCH */}
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Sipariş no veya müşteri ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
                />
              </div>
              {/* FILTER */}
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                >
                  <option value="ALL">Tüm Durumlar</option>
                  <option value="PAYMENT_PENDING">
                    Ödeme Bekliyor
                  </option>
                  <option value="PAID">Ödendi</option>
                  <option value="PREPARING">
                    Hazırlanıyor
                  </option>
                  <option value="SHIPPED">
                    Kargoya Verildi
                  </option>
                  <option value="DELIVERED">
                    Teslim Edildi
                  </option>
                  <option value="CANCELLED">
                    İptal Edildi
                  </option>
                  <option value="RETURNED">
                    İade Edildi
                  </option>
                </select>
              </div>
            </div>
          </div>
          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Sipariş
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Müşteri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Tutar
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Ödeme
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Tarih
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td colSpan={7} className="px-6 py-5">
                        <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="group border-b border-gray-100 transition hover:bg-gray-50/70 last:border-0"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-gray-950">
                            #{o.orderNumber}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Sipariş ID: {o.id}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                            {o.customerName
                              ?.charAt(0)
                              ?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-gray-800">
                            {o.customerName || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-semibold text-gray-950">
                          {formatPrice(o.total)} ₺
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600">
                          {o.paymentStatus || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-gray-600">
                          {formatDate(o.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 opacity-80 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 group-hover:opacity-100"
                        >
                          Detay
                          <ArrowUpRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* MOBILE */}
          <div className="lg:hidden">
            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-xl bg-gray-100"
                  />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="px-4 py-16">
                <EmptyState />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 transition hover:bg-gray-50"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-950">
                          #{o.orderNumber}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(o.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                        {o.customerName
                          ?.charAt(0)
                          ?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {o.customerName || "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {o.paymentStatus || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-base font-semibold text-gray-950">
                        {formatPrice(o.total)} ₺
                      </span>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
                      >
                        Siparişi Gör
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* FOOTER */}
          {!loading && filteredOrders.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {filteredOrders.length} sipariş gösteriliyor
              </span>
              {(search || statusFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="font-medium text-gray-700 transition hover:text-gray-950"
                >
                  Filtreleri temizle
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-gray-950">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 transition group-hover:bg-gray-100">
          <Icon size={19} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <ShoppingBag size={24} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">
        Sipariş bulunamadı
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Arama veya filtre kriterlerinize uygun herhangi bir
        sipariş bulunamadı.
      </p>
    </div>
  );
}
