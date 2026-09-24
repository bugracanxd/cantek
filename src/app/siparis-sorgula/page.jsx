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

const steps = [
  { key: "PAID", label: "Ödeme Alındı" },
  { key: "PREPARING", label: "Hazırlanıyor" },
  { key: "SHIPPED", label: "Kargoya Verildi" },
  { key: "DELIVERED", label: "Teslim Edildi" },
];

const statusOrder = {
  PAYMENT_PENDING: 0,
  PAID: 1,
  PREPARING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  RETURNED: -2,
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
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">📦</div>
          <h1 className="text-4xl font-bold">Sipariş Sorgulama</h1>
          <p className="text-gray-500 mt-3">
            Sipariş numaranızı girerek siparişinizin güncel durumunu görüntüleyin.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 rounded-3xl p-6 shadow-sm"
        >
          <label className="block text-sm font-medium mb-2">
            Sipariş Numarası
          </label>

          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Örn: CTK-123456"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-black py-3 font-medium text-white transition hover:bg-gray-800"
          >
            {loading ? "Sorgulanıyor..." : "Siparişi Sorgula"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {order && (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Üst Bilgiler */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                </p>
              </div>

              <span
                className={`${statusConfig[order.status].color} rounded-full px-4 py-2 text-sm font-medium text-white`}
              >
                {statusConfig[order.status].text}
              </span>
            </div>

            {/* İlerleme Çubuğu */}
            {statusOrder[order.status] >= 0 && (
              <div className="mt-10">
                <h3 className="mb-6 text-lg font-semibold">Sipariş Durumu</h3>

                <div className="relative">
                  <div className="absolute top-5 left-0 h-1 w-full rounded-full bg-gray-200"></div>

                  <div
                    className="absolute top-5 left-0 h-1 rounded-full bg-black transition-all duration-500"
                    style={{
                      width: `${((statusOrder[order.status] - 1) / 3) * 100}%`,
                    }}
                  />

                  <div className="relative flex justify-between">
                    {steps.map((step) => {
                      const active =
                        statusOrder[order.status] >= statusOrder[step.key];

                      return (
                        <div
                          key={step.key}
                          className="flex w-20 flex-col items-center text-center"
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                              active
                                ? "bg-black text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            ✓
                          </div>

                          <p
                            className={`mt-3 text-xs ${
                              active
                                ? "font-semibold text-black"
                                : "text-gray-500"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Bilgiler */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <p className="text-sm text-gray-500">Müşteri</p>
                <p className="font-semibold">{order.customerName}</p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-gray-500">Toplam Tutar</p>
                <p className="font-semibold">₺{order.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Ürünler */}
            <div className="mt-10 border-t pt-8">
              <h3 className="mb-4 text-lg font-semibold">Sipariş İçeriği</h3>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between rounded-xl border p-4"
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

            {/* Teslimat */}
            <div className="mt-10 border-t pt-8">
              <h3 className="mb-3 text-lg font-semibold">Teslimat Adresi</h3>
              <p className="leading-7 text-gray-600">{order.shippingAddress}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
