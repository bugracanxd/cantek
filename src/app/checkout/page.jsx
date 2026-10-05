"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
const FUR_PRICE = 500;
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
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    couponCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [iframeToken, setIframeToken] = useState(null);
  // --------------------------------------------------
  // LOGIN CHECK
  // --------------------------------------------------
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?redirect=/checkout");
    }
  }, [status, router]);
  // --------------------------------------------------
  // SESSION INFORMATION
  // --------------------------------------------------
  useEffect(() => {
    if (!session?.user) return;
    setForm((prev) => ({
      ...prev,
      customerName:
        typeof session.user.name === "string"
          ? session.user.name
          : prev.customerName,
      customerEmail:
        typeof session.user.email === "string"
          ? session.user.email
          : prev.customerEmail,
    }));
  }, [session]);
  // --------------------------------------------------
  // COUPON
  // --------------------------------------------------
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      couponCode:
        typeof couponCode === "string"
          ? couponCode
          : "",
    }));
  }, [couponCode]);
  // --------------------------------------------------
  // PAYTR IFRAME
  // --------------------------------------------------
  useEffect(() => {
    if (!iframeToken) return;
    const script = document.createElement("script");
    script.src =
      "https://www.paytr.com/js/iframeResizer.min.js";
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
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [iframeToken]);
  // --------------------------------------------------
  // SUBMIT ORDER
  // --------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Sepetiniz boş");
      return;
    }
    // Form validation
    const customerName = form.customerName.trim();
    const customerEmail = form.customerEmail.trim();
    const customerPhone = form.customerPhone.trim();
    const shippingAddress = form.shippingAddress.trim();
    const cleanCouponCode =
      typeof form.couponCode === "string"
        ? form.couponCode.trim()
        : "";
    if (!customerName) {
      toast.error("Ad soyad bilgisi gerekli.");
      return;
    }
    if (!customerEmail) {
      toast.error("E-posta bilgisi gerekli.");
      return;
    }
    if (!customerPhone) {
      toast.error("Telefon bilgisi gerekli.");
      return;
    }
    if (!shippingAddress) {
      toast.error("Adres bilgisi gerekli.");
      return;
    }
    // --------------------------------------------------
    // PRODUCT VALIDATION
    // --------------------------------------------------
    const invalidItem = items.find(
      (item) =>
        !item?.productId ||
        !item?.quantity ||
        Number(item.quantity) <= 0
    );
    if (invalidItem) {
      toast.error(
        "Sepetinizde geçersiz bir ürün bulunuyor. Lütfen sepeti yenileyin."
      );
      return;
    }
    setLoading(true);
    try {
      // --------------------------------------------------
      // ORDER ITEMS
      // --------------------------------------------------
      const orderItems = items.map((item) => {
        const itemData = {
          productId: String(item.productId),
          quantity: Number(item.quantity),
          furSelected: Boolean(item.furSelected),
        };
        // Sadece gerçekten değer varsa gönderiyoruz.
        if (
          item.size !== null &&
          item.size !== undefined &&
          String(item.size).trim() !== ""
        ) {
          itemData.size = String(item.size);
        }
        if (
          item.color !== null &&
          item.color !== undefined &&
          String(item.color).trim() !== ""
        ) {
          itemData.color = String(item.color);
        }
        return itemData;
      });
      // --------------------------------------------------
      // CREATE ORDER
      // --------------------------------------------------
      const orderBody = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        items: orderItems,
      };
      // Kupon varsa gönder.
      // Yoksa null göndermiyoruz.
      if (cleanCouponCode) {
        orderBody.couponCode = cleanCouponCode;
      }
      console.log("ORDER REQUEST:", orderBody);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderBody),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("ORDER API ERROR:", data);
        throw new Error(
          data.error ||
            data.message ||
            "Sipariş oluşturulamadı"
        );
      }
      if (!data?.order?.id) {
        console.error(
          "ORDER RESPONSE:",
          data
        );
        throw new Error(
          "Sipariş oluşturuldu ancak sipariş bilgisi alınamadı."
        );
      }
      // --------------------------------------------------
      // PAYTR PAYMENT
      // --------------------------------------------------
      const payRes = await fetch(
        "/api/payment/paytr/init",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: String(data.order.id),
          }),
        }
      );
      const payData = await payRes.json();
      if (!payRes.ok) {
        console.error(
          "PAYTR INIT ERROR:",
          payData
        );
        throw new Error(
          payData.error ||
            payData.message ||
            "Ödeme başlatılamadı"
        );
      }
      if (!payData?.token) {
        console.error(
          "PAYTR RESPONSE:",
          payData
        );
        throw new Error(
          "PayTR ödeme tokeni alınamadı."
        );
      }
      setIframeToken(payData.token);
      // --------------------------------------------------
      // CLEAR CART
      // --------------------------------------------------
      clearCart();
    } catch (err) {
      console.error(
        "Checkout error:",
        err
      );
      toast.error(
        err?.message ||
          "Bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }
  // --------------------------------------------------
  // SESSION LOADING
  // --------------------------------------------------
  if (status === "loading") {
    return (
      <div className="site-container py-20 text-center">
        <p className="text-gray-600">
          Kontrol ediliyor...
        </p>
      </div>
    );
  }
  // --------------------------------------------------
  // UNAUTHENTICATED
  // --------------------------------------------------
  if (status === "unauthenticated") {
    return (
      <div className="site-container py-20 text-center">
        <h1 className="mb-3 text-2xl font-bold">
          Giriş Yapmanız Gerekiyor
        </h1>
        <p className="text-gray-600">
          Ödeme yapabilmek için hesabınıza giriş
          yapmalısınız.
        </p>
      </div>
    );
  }
  // --------------------------------------------------
  // PAYTR IFRAME
  // --------------------------------------------------
  if (iframeToken) {
    return (
      <div className="fixed inset-0 z-[9999] h-[100dvh] overflow-auto bg-white">
        <div className="site-container py-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">
              Güvenli Ödeme
            </h1>
            <button
              type="button"
              onClick={() =>
                setIframeToken(null)
              }
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
  // --------------------------------------------------
  // CHECKOUT
  // --------------------------------------------------
  return (
    <div className="site-container grid gap-10 py-10 md:grid-cols-3">
      {/* DELIVERY FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 md:col-span-2"
      >
        <h1 className="mb-2 text-2xl font-bold">
          Teslimat Bilgileri
        </h1>
        <input
          type="text"
          placeholder="Ad Soyad"
          required
          className="w-full rounded-site border px-4 py-3"
          value={form.customerName}
          onChange={(e) =>
            setForm({
              ...form,
              customerName: e.target.value,
            })
          }
        />
        <input
          type="email"
          placeholder="E-posta"
          required
          className="w-full rounded-site border px-4 py-3"
          value={form.customerEmail}
          onChange={(e) =>
            setForm({
              ...form,
              customerEmail: e.target.value,
            })
          }
        />
        <input
          type="tel"
          placeholder="Telefon"
          required
          className="w-full rounded-site border px-4 py-3"
          value={form.customerPhone}
          onChange={(e) =>
            setForm({
              ...form,
              customerPhone: e.target.value,
            })
          }
        />
        <textarea
          placeholder="Adres"
          required
          rows={3}
          className="w-full rounded-site border px-4 py-3"
          value={form.shippingAddress}
          onChange={(e) =>
            setForm({
              ...form,
              shippingAddress: e.target.value,
            })
          }
        />
        <input
          type="text"
          placeholder="Kupon kodu"
          className="w-full rounded-site border bg-gray-50 px-4 py-3"
          value={form.couponCode}
          readOnly
        />
        <button
          type="submit"
          disabled={loading}
          className="
            btn-primary
            w-full
            py-3
            font-medium
            disabled:opacity-50
          "
        >
          {loading
            ? "Yönlendiriliyor..."
            : "Ödemeye Geç"}
        </button>
      </form>
      {/* ORDER SUMMARY */}
      <div className="h-fit rounded-site border p-6">
        <h2 className="mb-4 font-semibold">
          Sipariş Özeti
        </h2>
        {items.map((item, index) => {
          const furSelected = Boolean(
            item.furSelected
          );
          const basePrice = Number(
            item.price || 0
          );
          const unitPrice =
            basePrice +
            (furSelected ? FUR_PRICE : 0);
          const itemTotal =
            unitPrice *
            Number(item.quantity || 0);
          return (
            <div
              key={`${item.productId}-${item.size || "no-size"}-${item.color || "no-color"}-${furSelected ? "fur" : "standard"}-${index}`}
              className="mb-4 border-b pb-3"
            >
              <div className="flex justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <div className="font-medium">
                    {item.name} x{item.quantity}
                  </div>
                  {(item.size ||
                    item.color) && (
                    <div className="mt-1 text-xs text-gray-500">
                      {item.size &&
                        `Beden: ${item.size}`}
                      {item.size &&
                        item.color &&
                        " · "}
                      {item.color &&
                        `Renk: ${item.color}`}
                    </div>
                  )}
                  {furSelected && (
                    <div className="mt-1 text-xs font-medium text-gray-600">
                      Kürklü (+
                      {FUR_PRICE.toFixed(2)}
                      ₺)
                    </div>
                  )}
                </div>
                <span className="shrink-0 font-medium">
                  {itemTotal.toFixed(2)} ₺
                </span>
              </div>
            </div>
          );
        })}
        {/* SUBTOTAL */}
        <div className="mb-2 flex justify-between">
          <span>Ara Toplam</span>
          <span>
            {Number(subtotal || 0).toFixed(2)} ₺
          </span>
        </div>
        {/* DISCOUNT */}
        {Number(discount || 0) > 0 && (
          <div className="mb-2 flex justify-between text-green-600">
            <span>
              İndirim
              {couponCode
                ? ` (${couponCode})`
                : ""}
            </span>
            <span>
              -
              {Number(discount || 0).toFixed(2)} ₺
            </span>
          </div>
        )}
        {/* SHIPPING */}
        <div className="mb-2 flex justify-between">
          <span>Kargo</span>
          <span>
            {Number(shippingCost || 0).toFixed(2)} ₺
          </span>
        </div>
        {/* TOTAL */}
        <div className="flex justify-between border-t pt-3 text-lg font-semibold">
          <span>Toplam</span>
          <span>
            {Number(
              couponCode
                ? total
                : subtotal
            ).toFixed(2)}{" "}
            ₺
          </span>
        </div>
      </div>
    </div>
  );
}
