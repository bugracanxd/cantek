"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const STATUSES = ["PAYMENT_PENDING", "PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

export default function AdminOrderDetailPage({ params }) {
  const [order, setOrder] = useState(null);

  function load() {
    fetch(`/api/orders/${params.id}`).then((r) => r.json()).then((d) => setOrder(d.order));
  }
  useEffect(load, [params.id]);

  async function updateStatus(status) {
    const res = await fetch(`/api/orders/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Durum güncellendi");
      load();
    } else {
      toast.error("Güncellenemedi");
    }
  }

  if (!order) return <p>Yükleniyor...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Sipariş #{order.orderNumber}</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-1 text-sm">
        <div><strong>Müşteri:</strong> {order.customerName}</div>
        <div><strong>E-posta:</strong> {order.customerEmail}</div>
        <div><strong>Telefon:</strong> {order.customerPhone}</div>
        <div><strong>Adres:</strong> {order.shippingAddress}</div>
        <div><strong>Ödeme Durumu:</strong> {order.paymentStatus}</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-semibold mb-3">Ürünler</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1 border-b">
            <span>{item.name} ({item.size}{item.color ? `, ${item.color}` : ""}) x{item.quantity}</span>
            <span>{(item.unitPrice * item.quantity).toFixed(2)} ₺</span>
          </div>
        ))}
        <div className="flex justify-between text-sm pt-2"><span>Ara Toplam</span><span>{order.subtotal.toFixed(2)} ₺</span></div>
        <div className="flex justify-between text-sm"><span>Kargo</span><span>{order.shippingCost.toFixed(2)} ₺</span></div>
        <div className="flex justify-between text-sm"><span>İndirim</span><span>-{order.discount.toFixed(2)} ₺</span></div>
        <div className="flex justify-between font-semibold pt-2"><span>Toplam</span><span>{order.total.toFixed(2)} ₺</span></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-3">Sipariş Durumu</h2>
        <select
          className="border rounded-lg px-3 py-2"
          value={order.status}
          onChange={(e) => updateStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
