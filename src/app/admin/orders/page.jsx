"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_LABELS = {
  PAYMENT_PENDING: "Ödeme Bekliyor",
  PAID: "Ödendi",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya Verildi",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  RETURNED: "İade Edildi",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/admin/orders").then((r) => r.json()).then((d) => setOrders(d.orders || []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Siparişler</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Sipariş No</th>
              <th className="p-3">Müşteri</th>
              <th className="p-3">Tutar</th>
              <th className="p-3">Ödeme</th>
              <th className="p-3">Durum</th>
              <th className="p-3">Tarih</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.orderNumber}</td>
                <td className="p-3">{o.customerName}</td>
                <td className="p-3">{o.total.toFixed(2)} ₺</td>
                <td className="p-3">{o.paymentStatus}</td>
                <td className="p-3">{STATUS_LABELS[o.status]}</td>
                <td className="p-3">{new Date(o.createdAt).toLocaleDateString("tr-TR")}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/orders/${o.id}`} className="text-blue-600">Detay</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
