"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cantek_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [total, setTotal] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const data = JSON.parse(raw);

        // Eski formatı da destekle
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems(data.items || []);
          setCouponCode(data.couponCode || "");
          setDiscount(data.discount || 0);
          setShippingCost(data.shippingCost || 0);
          setTotal(data.total || 0);
        }
      }
    } catch (e) {
      // sepet okunamazsa sessizce boş başlat
    }

    setHydrated(true);
  }, []);

  const subtotal = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        items,
        couponCode,
        discount,
        shippingCost,
        total,
      })
    );
  }, [
    items,
    couponCode,
    discount,
    shippingCost,
    total,
    hydrated,
  ]);

  // Sepet değiştiğinde eski indirim sonucunu sıfırla
  useEffect(() => {
    if (!couponCode) {
      setTotal(subtotal);
      return;
    }

    // Ürün/sepet değiştiyse eski sunucu sonucuna güvenmeyelim
    setDiscount(0);
    setShippingCost(0);
    setTotal(subtotal);
    setCouponError("");
  }, [subtotal]);

  function addItem(product, size, color, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === product.id &&
          i.size === size &&
          i.color === color
      );

      if (existing) {
        return prev.map((i) =>
          i === existing
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images?.[0]?.url,
          price: product.discountedPrice || product.price,
          size,
          color,
          quantity,
        },
      ];
    });
  }

  function updateQuantity(productId, size, color, quantity) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId &&
          i.size === size &&
          i.color === color
            ? { ...i, quantity }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(productId, size, color) {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.productId === productId &&
            i.size === size &&
            i.color === color
          )
      )
    );
  }

  async function applyCoupon(code) {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponError("Kupon kodu girin.");
      return false;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: normalizedCode,
          subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCouponCode("");
        setDiscount(0);
        setShippingCost(0);
        setTotal(subtotal);
        setCouponError(data.error || "Kupon uygulanamadı.");
        return false;
      }

      setCouponCode(data.couponCode);
      setDiscount(data.discount);
      setShippingCost(data.shippingCost);
      setTotal(data.total);

      return true;
    } catch (error) {
      setCouponError("Kupon kontrol edilirken bir hata oluştu.");
      return false;
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponCode("");
    setDiscount(0);
    setShippingCost(0);
    setTotal(subtotal);
    setCouponError("");
  }

  function clearCart() {
    setItems([]);
    setCouponCode("");
    setDiscount(0);
    setShippingCost(0);
    setTotal(0);
    setCouponError("");
  }

  const itemCount = items.reduce(
    (sum, i) => sum + i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,

        subtotal,
        itemCount,
        hydrated,

        couponCode,
        discount,
        shippingCost,
        total,

        applyCoupon,
        removeCoupon,
        couponLoading,
        couponError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }

  return ctx;
}
