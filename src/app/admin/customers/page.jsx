"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  UserRound,
  ShoppingBag,
  CalendarDays,
  Mail,
} from "lucide-react";
export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);
  const filteredCustomers = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return customers;
    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(value) ||
        customer.email?.toLowerCase().includes(value)
    );
  }, [customers, search]);
  const totalOrders = useMemo(() => {
    return customers.reduce(
      (total, customer) => total + Number(customer._count?.orders || 0),
      0
    );
  }, [customers]);
  function formatDate(value) {
    return new Date(value).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  function getInitial(name) {
    return name?.trim()?.charAt(0)?.toUpperCase() || "?";
  }
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Users size={16} />
              <span>Admin Panel</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-700">Müşteriler</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
              Müşteriler
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Mağazanıza kayıt olan müşterileri buradan görüntüleyin.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
            <Users size={17} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {customers.length} müşteri
            </span>
          </div>
        </div>
        {/* STAT CARDS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            title="Toplam Müşteri"
            value={customers.length}
            icon={Users}
          />
          <StatCard
            title="Toplam Sipariş"
            value={totalOrders}
            icon={ShoppingBag}
          />
        </div>
        {/* MAIN CARD */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* TOOLBAR */}
          <div className="border-b border-gray-100 p-4 sm:p-5">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Müşteri adı veya e-posta ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
              />
            </div>
          </div>
          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Müşteri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    E-posta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Siparişler
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Kayıt Tarihi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td colSpan={4} className="px-6 py-5">
                        <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="group border-b border-gray-100 transition hover:bg-gray-50/70 last:border-0"
                    >
                      {/* CUSTOMER */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                            {getInitial(customer.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-950">
                              {customer.name || "İsimsiz Müşteri"}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-400">
                              ID: {customer.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* EMAIL */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={15} className="text-gray-400" />
                          <span>{customer.email || "—"}</span>
                        </div>
                      </td>
                      {/* ORDERS */}
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                          <ShoppingBag size={14} />
                          {customer._count?.orders || 0} sipariş
                        </span>
                      </td>
                      {/* DATE */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarDays
                            size={15}
                            className="text-gray-400"
                          />
                          <span>
                            {formatDate(customer.createdAt)}
                          </span>
                        </div>
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
            ) : filteredCustomers.length === 0 ? (
              <div className="px-4 py-16">
                <EmptyState />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-4 transition hover:bg-gray-50"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                        {getInitial(customer.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-950">
                          {customer.name || "İsimsiz Müşteri"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {customer.email || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <p className="mb-1 text-xs text-gray-400">
                          Sipariş
                        </p>
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag
                            size={14}
                            className="text-gray-400"
                          />
                          <span className="text-sm font-semibold text-gray-800">
                            {customer._count?.orders || 0}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <p className="mb-1 text-xs text-gray-400">
                          Kayıt
                        </p>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays
                            size={14}
                            className="text-gray-400"
                          />
                          <span className="text-xs font-medium text-gray-700">
                            {formatDate(customer.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* FOOTER */}
          {!loading && filteredCustomers.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {filteredCustomers.length} müşteri gösteriliyor
              </span>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="font-medium text-gray-700 transition hover:text-gray-950"
                >
                  Aramayı temizle
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
        <UserRound size={24} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">
        Müşteri bulunamadı
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Arama kriterlerinize uygun bir müşteri bulunamadı.
      </p>
    </div>
  );
}
