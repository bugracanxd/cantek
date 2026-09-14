"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/dashboard").then((r) => r.json()).then(setStats);
    }
  }, [status]);

  if (!stats) return <p>Yükleniyor...</p>;

  const cards = [
    { label: "Toplam Satış", value: `${stats.totalSales.toFixed(2)} ₺` },
    { label: "Bugünkü Satış", value: `${stats.todaySales.toFixed(2)} ₺` },
    { label: "Aylık Satış", value: `${stats.monthSales.toFixed(2)} ₺` },
    { label: "Toplam Sipariş", value: stats.orderCount },
    { label: "Bekleyen Sipariş", value: stats.pendingOrders },
    { label: "Başarılı Ödeme", value: stats.paidOrders },
    { label: "Başarısız Ödeme", value: stats.failedOrders },
    { label: "Ürün Sayısı", value: stats.productCount },
    { label: "Düşük Stok", value: stats.lowStockProducts },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className="text-2xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Son Siparişler</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Sipariş No</th>
              <th className="p-3">Müşteri</th>
              <th className="p-3">Tutar</th>
              <th className="p-3">Durum</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.orderNumber}</td>
                <td className="p-3">{o.customerName}</td>
                <td className="p-3">{o.total.toFixed(2)} ₺</td>
                <td className="p-3">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
