"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: session?.user?.name || "",
    customerEmail: session?.user?.email || "",
    customerPhone: "",
    shippingAddress: "",
    couponCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [iframeToken, setIframeToken] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Sepetiniz boş");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sipariş oluşturulamadı");

      // PAYTR ödeme token'ı iste
      const payRes = await fetch("/api/payment/paytr/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.order.id }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || "Ödeme başlatılamadı");

      setIframeToken(payData.token);
      clearCart();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (iframeToken) {
    return (
      <div className="site-container py-10">
        <h1 className="text-2xl font-bold mb-6">Ödeme</h1>
        <iframe
          src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
          id="paytriframe"
          frameBorder="0"
          scrolling="no"
          style={{ width: "100%", minHeight: "800px" }}
        />
        <script src="https://www.paytr.com/js/iframeResizer.min.js"></script>
      </div>
    );
  }

  return (
    <div className="site-container py-10 grid md:grid-cols-3 gap-10">
      <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold mb-2">Teslimat Bilgileri</h1>
        <input
          type="text"
          placeholder="Ad Soyad"
          required
          className="w-full border px-4 py-3 rounded-site"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
        />
        <input
          type="email"
          placeholder="E-posta"
          required
          className="w-full border px-4 py-3 rounded-site"
          value={form.customerEmail}
          onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Telefon"
          required
          className="w-full border px-4 py-3 rounded-site"
          value={form.customerPhone}
          onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
        />
        <textarea
          placeholder="Adres"
          required
          rows={3}
          className="w-full border px-4 py-3 rounded-site"
          value={form.shippingAddress}
          onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
        />
        <input
          type="text"
          placeholder="Kupon kodu (opsiyonel)"
          className="w-full border px-4 py-3 rounded-site"
          value={form.couponCode}
          onChange={(e) => setForm({ ...form, couponCode: e.target.value })}
        />
        <button disabled={loading} className="btn-primary w-full py-3 font-medium disabled:opacity-50">
          {loading ? "Yönlendiriliyor..." : "Ödemeye Geç"}
        </button>
      </form>

      <div className="border rounded-site p-6 h-fit">
        <h2 className="font-semibold mb-4">Sipariş Özeti</h2>
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm mb-2">
            <span>{item.name} x{item.quantity}</span>
            <span>{(item.price * item.quantity).toFixed(2)} ₺</span>
          </div>
        ))}
        <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
          <span>Ara Toplam</span>
          <span>{subtotal.toFixed(2)} ₺</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Kargo ve indirim tutarı ödeme öncesi sunucuda hesaplanır.</p>
      </div>
    </div>
  );
}
