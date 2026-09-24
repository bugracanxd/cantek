"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const STATUS = {
  PAYMENT_PENDING: {
    label: "Ödeme Bekliyor",
    className: "bg-amber-100 text-amber-700",
  },
  PAID: {
    label: "Ödendi",
    className: "bg-blue-100 text-blue-700",
  },
  PREPARING: {
    label: "Hazırlanıyor",
    className: "bg-purple-100 text-purple-700",
  },
  SHIPPED: {
    label: "Kargoya Verildi",
    className: "bg-cyan-100 text-cyan-700",
  },
  DELIVERED: {
    label: "Teslim Edildi",
    className: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "İptal",
    className: "bg-red-100 text-red-700",
  },
  RETURNED: {
    label: "İade",
    className: "bg-zinc-200 text-zinc-700",
  },
};

export default function AdminDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/dashboard")
        .then((r) => r.json())
        .then(setStats);
    }
  }, [status]);

  if (!stats) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="animate-pulse text-zinc-500">Yükleniyor...</div>
      </div>
    );
  }

  const cards = [
    {
      label: "Toplam Satış",
      value: `${stats.totalSales.toFixed(2)} ₺`,
      icon: DollarSign,
    },
    {
      label: "Bugünkü Satış",
      value: `${stats.todaySales.toFixed(2)} ₺`,
      icon: TrendingUp,
    },
    {
      label: "Aylık Satış",
      value: `${stats.monthSales.toFixed(2)} ₺`,
      icon: DollarSign,
    },
    {
      label: "Toplam Sipariş",
      value: stats.orderCount,
      icon: ShoppingBag,
    },
    {
      label: "Bekleyen Sipariş",
      value: stats.pendingOrders,
      icon: Clock3,
    },
    {
      label: "Başarılı Ödeme",
      value: stats.paidOrders,
      icon: CheckCircle2,
    },
    {
      label: "Başarısız Ödeme",
      value: stats.failedOrders,
      icon: XCircle,
    },
    {
      label: "Ürün Sayısı",
      value: stats.productCount,
      icon: Package,
    },
    {
      label: "Düşük Stok",
      value: stats.lowStockProducts,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            Dashboard
          </h1>
          <p className="mt-1 text-zinc-500">
            CANTEK mağazanızın genel durumu
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-500 shadow-sm">
          Admin Panel
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;

          return (
            <div
              key={c.label}
              className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white transition-transform duration-300 group-hover:scale-110">
                <Icon size={22} />
              </div>

              <p className="text-sm text-zinc-500">{c.label}</p>

              <h2 className="mt-1 text-2xl font-bold text-zinc-900">
                {c.value}
              </h2>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              Son Siparişler
            </h2>
            <p className="text-sm text-zinc-500">
              Son oluşturulan siparişler
            </p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-6 py-4">Sipariş No</th>
              <th className="px-6 py-4">Müşteri</th>
              <th className="px-6 py-4">Tutar</th>
              <th className="px-6 py-4">Durum</th>
            </tr>
          </thead>

          <tbody>
            {stats.recentOrders.map((o) => (
              <tr
                key={o.id}
                className="border-t border-zinc-100 transition hover:bg-zinc-50"
              >
                <td className="px-6 py-4 font-semibold text-zinc-900">
                  {o.orderNumber}
                </td>

                <td className="px-6 py-4 text-zinc-700">
                  {o.customerName}
                </td>

                <td className="px-6 py-4 font-medium text-zinc-900">
                  {o.total.toFixed(2)} ₺
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      STATUS[o.status]?.className ||
                      "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {STATUS[o.status]?.label || o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
