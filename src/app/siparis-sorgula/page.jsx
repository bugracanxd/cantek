"use client";

import { useState } from "react";

const statusConfig = {
  PAYMENT_PENDING: { text: "Ödeme Bekleniyor", color: "bg-yellow-500" },
  PAID: { text: "Ödeme Alındı", color: "bg-blue-500" },
  PREPARING: { text: "Hazırlanıyor", color: "bg-orange-500" },
  SHIPPED: { text: "Kargoya Verildi", color: "bg-indigo-500" },
  DELIVERED: { text: "Teslim Edildi", color: "bg-green-600" },
  CANCELLED: { text: "İptal Edildi", color: "bg-red-500" },
  RETURNED: { text: "İade Edildi", color: "bg-gray-500" },
};

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!orderNumber.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch("/api/order-track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sipariş bulunamadı.");
      } else {
        setOrder(data);
      }
    } catch {
      setError("Bir hata oluştu.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">📦</div>
          <h1 className="text-4xl font-bold">Sipariş Sorgulama</h1>
          <p className="text-gray-500 mt-3">
            Sipariş numaranızı girerek sipariş durumunuzu görüntüleyin.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border rounded-2xl p-6 shadow-sm"
        >
          <label className="block text-sm font-medium mb-2">
            Sipariş Numarası
          </label>

          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Örn: CTK-123456"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition"
          >
            {loading ? "Sorgulanıyor..." : "Siparişi Sorgula"}
          </button>
        </form>

        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 text-red-600 rounded-xl p-4">
            {error}
          </div>
        )}

        {order && (
          <div className="mt-8 border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
                <p className="text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                </p>
              </div>

              <span
                className={`${statusConfig[order.status].color} text-white px-4 py-2 rounded-full text-sm`}
              >
                {statusConfig[order.status].text}
              </span>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4">
                <p className="text-gray-500 text-sm">Müşteri</p>
                <p className="font-semibold">{order.customerName}</p>
              </div>

              <div className="border rounded-xl p-4">
                <p className="text-gray-500 text-sm">Toplam</p>
                <p className="font-semibold">
                  ₺{order.total.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4">Sipariş İçeriği</h3>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-xl p-4 flex justify-between"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Beden: {item.size}
                        {item.color ? ` • ${item.color}` : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p>{item.quantity} adet</p>
                      <p className="font-semibold">
                        ₺{(item.quantity * item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <h3 className="font-semibold text-lg mb-3">Teslimat Adresi</h3>
              <p className="text-gray-600">{order.shippingAddress}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
