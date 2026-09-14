"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const STATUS_LABELS = {
  PAYMENT_PENDING: "Ödeme Bekliyor",
  PAID: "Ödendi",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya Verildi",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  RETURNED: "İade Edildi",
};

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => setOrders(data.orders || []))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status !== "authenticated") return null;

  return (
    <div className="site-container py-10">
      <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Henüz siparişiniz yok.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border rounded-site p-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">#{o.orderNumber}</span>
                <span className="text-sm">{STATUS_LABELS[o.status]}</span>
              </div>
              <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString("tr-TR")}</div>
              <div className="font-semibold mt-2">{o.total.toFixed(2)} ₺</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
