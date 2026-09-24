"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Truck,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
  PackageCheck,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
const STATUSES = [
  "PAYMENT_PENDING",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];
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
  PAYMENT_PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PREPARING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  RETURNED: "bg-orange-50 text-orange-700 border-orange-200",
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
export default function AdminOrderDetailPage({ params }) {
  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  function load() {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order));
  }
  useEffect(() => {
    load();
  }, [params.id]);
  async function updateStatus(status) {
    setUpdating(true);
    const res = await fetch(`/api/orders/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Sipariş durumu güncellendi");
      load();
    } else {
      toast.error("Sipariş durumu güncellenemedi");
    }
    setUpdating(false);
  }
  function formatPrice(value) {
    return Number(value || 0).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  function StatusBadge({ status }) {
    const Icon = STATUS_ICONS[status] || Clock3;
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
          STATUS_STYLES[status] ||
          "border-gray-200 bg-gray-50 text-gray-700"
        }`}
      >
        <Icon size={14} />
        {STATUS_LABELS[status] || status}
      </span>
    );
  }
  if (!order) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 h-5 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mb-8 h-10 w-80 animate-pulse rounded-lg bg-gray-200" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
              <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />
            </div>
            <div className="h-72 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/admin/orders"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
          >
            <ArrowLeft size={16} />
            Siparişlere Dön
          </Link>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                <ShoppingBag size={16} />
                <span>Admin Panel</span>
                <ChevronRight size={14} className="text-gray-300" />
                <span>Siparişler</span>
                <ChevronRight size={14} className="text-gray-300" />
                <span className="text-gray-700">
                  #{order.orderNumber}
                </span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
                Sipariş #{order.orderNumber}
              </h1>
              {order.createdAt && (
                <p className="mt-2 text-sm text-gray-500">
                  {formatDate(order.createdAt)} tarihinde oluşturuldu
                </p>
              )}
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>
        {/* CONTENT */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">
            {/* CUSTOMER */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    <User size={19} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-950">
                      Müşteri Bilgileri
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Sipariş sahibinin iletişim bilgileri
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-px bg-gray-100 sm:grid-cols-2">
                <InfoItem
                  icon={User}
                  label="Müşteri"
                  value={order.customerName}
                />
                <InfoItem
                  icon={Mail}
                  label="E-posta"
                  value={order.customerEmail}
                />
                <InfoItem
                  icon={Phone}
                  label="Telefon"
                  value={order.customerPhone}
                />
                <InfoItem
                  icon={MapPin}
                  label="Teslimat Adresi"
                  value={order.shippingAddress}
                  full
                />
              </div>
            </section>
            {/* PRODUCTS */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                      <Package size={19} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-950">
                        Sipariş Ürünleri
                      </h2>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {order.items?.length || 0} farklı ürün
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                        <Package size={20} className="text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-950">
                          {item.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {item.size && (
                            <span className="rounded-md bg-gray-100 px-2 py-1">
                              Beden: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="rounded-md bg-gray-100 px-2 py-1">
                              Renk: {item.color}
                            </span>
                          )}
                          <span className="rounded-md bg-gray-100 px-2 py-1">
                            Adet: {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-sm font-semibold text-gray-950">
                        {formatPrice(
                          item.unitPrice * item.quantity
                        )}{" "}
                        ₺
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatPrice(item.unitPrice)} ₺ / adet
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* TOTALS */}
              <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-5 sm:px-6">
                <div className="ml-auto max-w-md space-y-3">
                  <PriceRow
                    label="Ara Toplam"
                    value={`${formatPrice(order.subtotal)} ₺`}
                  />
                  <PriceRow
                    label="Kargo"
                    value={`${formatPrice(order.shippingCost)} ₺`}
                  />
                  <PriceRow
                    label="İndirim"
                    value={`-${formatPrice(order.discount)} ₺`}
                    negative
                  />
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-950">
                        Genel Toplam
                      </span>
                      <span className="text-xl font-bold tracking-tight text-gray-950">
                        {formatPrice(order.total)} ₺
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          {/* RIGHT */}
          <div className="space-y-6">
            {/* ORDER STATUS */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <Truck size={19} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-950">
                    Sipariş Durumu
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Siparişin mevcut durumunu yönetin
                  </p>
                </div>
              </div>
              <div className="mb-5">
                <StatusBadge status={order.status} />
              </div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Durumu Değiştir
              </label>
              <select
                disabled={updating}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-800 outline-none transition hover:border-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                value={order.status}
                onChange={(e) => updateStatus(e.target.value)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              {updating && (
                <p className="mt-2 text-xs text-gray-400">
                  Durum güncelleniyor...
                </p>
              )}
            </section>
            {/* PAYMENT */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <CreditCard size={19} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-950">
                    Ödeme Bilgileri
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Ödeme durumu
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  Ödeme Durumu
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {order.paymentStatus || "—"}
                </p>
              </div>
            </section>
            {/* SUMMARY */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <ShoppingBag size={19} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-950">
                    Sipariş Özeti
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Genel sipariş bilgileri
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <SummaryRow
                  label="Sipariş No"
                  value={`#${order.orderNumber}`}
                />
                <SummaryRow
                  label="Ürün Sayısı"
                  value={`${order.items?.reduce(
                    (sum, item) => sum + Number(item.quantity || 0),
                    0
                  ) || 0} adet`}
                />
                <SummaryRow
                  label="Sipariş Tarihi"
                  value={formatDate(order.createdAt)}
                />
                <div className="border-t border-gray-100 pt-4">
                  <SummaryRow
                    label="Toplam"
                    value={`${formatPrice(order.total)} ₺`}
                    strong
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
function InfoItem({ icon: Icon, label, value, full }) {
  return (
    <div
      className={`bg-white p-5 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 text-gray-400">
          <Icon size={17} />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-xs font-medium text-gray-400">
            {label}
          </p>
          <p className="break-words text-sm font-medium text-gray-900">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
function PriceRow({ label, value, negative }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span
        className={`font-medium ${
          negative ? "text-emerald-600" : "text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
function SummaryRow({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-right ${
          strong
            ? "text-base font-bold text-gray-950"
            : "text-sm font-medium text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
