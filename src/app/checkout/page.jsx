"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    discount,
    shippingCost,
    total,
    couponCode,
    clearCart,
  } = useCart();

  const { data: session } = useSession();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    couponCode: couponCode || "",
  });

  const [loading, setLoading] = useState(false);
  const [iframeToken, setIframeToken] = useState(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      customerName: session?.user?.name || prev.customerName,
      customerEmail: session?.user?.email || prev.customerEmail,
    }));
  }, [session]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      couponCode,
    }));
  }, [couponCode]);

  useEffect(() => {
    if (!iframeToken) return;

    const script = document.createElement("script");
    script.src = "https://www.paytr.com/js/iframeResizer.min.js";

    script.onload = () => {
      if (window.iFrameResize) {
        window.iFrameResize(
          {
            checkOrigin: false,
            scrolling: true,
            heightCalculationMethod: "bodyScroll",
          },
          "#paytriframe"
        );
      }
    };

    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, [iframeToken]);

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
        headers: {
          "Content-Type": "application/json",
        },
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

      if (!res.ok) {
        throw new Error(data.error || "Sipariş oluşturulamadı");
      }

      const payRes = await fetch("/api/payment/paytr/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: data.order.id,
        }),
      });

      const payData = await payRes.json();

      if (!payRes.ok) {
        throw new Error(payData.error || "Ödeme başlatılamadı");
      }

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
      <div className="fixed inset-0 z-[9999] bg-white h-[100dvh] overflow-auto">
        <div className="site-container py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Güvenli Ödeme</h1>

            <button
              onClick={() => setIframeToken(null)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Kapat
            </button>
          </div>

          <iframe
            id="paytriframe"
            src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
            title="PAYTR Güvenli Ödeme"
            frameBorder="0"
            scrolling="yes"
            allow="payment *"
            className="w-full rounded-xl border-0"
            style={{
              width: "100%",
              minHeight: "1200px",
            }}
          />
        </div>
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
          onChange={(e) =>
            setForm({ ...form, customerName: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="E-posta"
          required
          className="w-full border px-4 py-3 rounded-site"
          value={form.customerEmail}
          onChange={(e) =>
            setForm({ ...form, customerEmail: e.target.value })
          }
        />

        <input
          type="tel"
          placeholder="Telefon"
          required
          className="w-full border px-4 py-3 rounded-site"
          value={form.customerPhone}
          onChange={(e) =>
            setForm({ ...form, customerPhone: e.target.value })
          }
        />

        <textarea
          placeholder="Adres"
          required
          rows={3}
          className="w-full border px-4 py-3 rounded-site"
          value={form.shippingAddress}
          onChange={(e) =>
            setForm({ ...form, shippingAddress: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Kupon kodu"
          className="w-full border px-4 py-3 rounded-site bg-gray-50"
          value={form.couponCode}
          readOnly
        />

        <button
          disabled={loading}
          className="btn-primary w-full py-3 font-medium disabled:opacity-50"
        >
          {loading ? "Yönlendiriliyor..." : "Ödemeye Geç"}
        </button>
      </form>

      <div className="border rounded-site p-6 h-fit">
        <h2 className="font-semibold mb-4">Sipariş Özeti</h2>

        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm mb-2">
            <span>
              {item.name} x{item.quantity}
            </span>

            <span>{(item.price * item.quantity).toFixed(2)} ₺</span>
          </div>
        ))}

        <div className="border-t mt-3 pt-3 flex justify-between mb-2">
          <span>Ara Toplam</span>
          <span>{subtotal.toFixed(2)} ₺</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between mb-2 text-green-600">
            <span>İndirim ({couponCode})</span>
            <span>-{discount.toFixed(2)} ₺</span>
          </div>
        )}

        <div className="flex justify-between mb-2">
          <span>Kargo</span>
          <span>{shippingCost.toFixed(2)} ₺</span>
        </div>

        <div className="border-t pt-3 flex justify-between font-semibold text-lg">
          <span>Toplam</span>
          <span>{(couponCode ? total : subtotal).toFixed(2)} ₺</span>
        </div>
      </div>
    </div>
  );
}
