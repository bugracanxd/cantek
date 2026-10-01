"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cantek_cart_v1";

const FUR_PRICE = 500;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [total, setTotal] = useState(0);

  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // --------------------------------------------------
  // SUBTOTAL
  // --------------------------------------------------

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  // --------------------------------------------------
  // LOAD CART
  // --------------------------------------------------

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const data = JSON.parse(raw);

        if (Array.isArray(data)) {
          /*
           * Eski sepet formatını destekle.
           * Eski ürünlerde furSelected bulunmuyorsa false kabul edilir.
           */
          setItems(
            data.map((item) => ({
              ...item,
              furSelected: Boolean(item.furSelected),
            }))
          );
        } else {
          setItems(
            Array.isArray(data.items)
              ? data.items.map((item) => ({
                  ...item,
                  furSelected: Boolean(item.furSelected),
                }))
              : []
          );

          setCouponCode(data.couponCode || "");
          setDiscount(Number(data.discount) || 0);
          setShippingCost(Number(data.shippingCost) || 0);
          setTotal(Number(data.total) || 0);
        }
      }
    } catch (e) {
      console.error("Sepet okunamadı:", e);
    }

    setHydrated(true);
  }, []);

  // --------------------------------------------------
  // SAVE CART
  // --------------------------------------------------

  useEffect(() => {
    if (!hydrated) return;

    try {
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
    } catch (e) {
      console.error("Sepet kaydedilemedi:", e);
    }
  }, [
    items,
    couponCode,
    discount,
    shippingCost,
    total,
    hydrated,
  ]);

  // --------------------------------------------------
  // ADD ITEM
  // --------------------------------------------------

  function addItem(
    product,
    size,
    color,
    quantity = 1,
    furSelected = false
  ) {
    const selectedFur = Boolean(furSelected);

    const basePrice =
      product.discountedPrice &&
      Number(product.discountedPrice) < Number(product.price)
        ? Number(product.discountedPrice)
        : Number(product.price);

    const finalPrice =
      basePrice + (selectedFur ? FUR_PRICE : 0);

    setItems((prev) => {
      /*
       * Kürklü ve kürksüz seçenekler ayrı sepet ürünü olmalı.
       */
      const existing = prev.find(
        (item) =>
          item.productId === product.id &&
          item.size === size &&
          item.color === color &&
          Boolean(item.furSelected) === selectedFur
      );

      if (existing) {
        return prev.map((item) =>
          item === existing
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images?.[0]?.url,
          price: finalPrice,
          size,
          color,
          quantity,
          furSelected: selectedFur,
        },
      ];
    });

    /*
     * Sepet değiştiğinde eski kupon hesabını
     * geçersiz kıl.
     */
    setCouponCode("");
    setDiscount(0);
    setShippingCost(0);
    setTotal(0);
    setCouponError("");
  }

  // --------------------------------------------------
  // UPDATE QUANTITY
  // --------------------------------------------------

  function updateQuantity(
    productId,
    size,
    color,
    quantity,
    furSelected = false
  ) {
    const selectedFur = Boolean(furSelected);

    setItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId &&
          item.size === size &&
          item.color === color &&
          Boolean(item.furSelected) === selectedFur
            ? {
                ...item,
                quantity,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    setCouponCode("");
    setDiscount(0);
    setShippingCost(0);
    setTotal(0);
    setCouponError("");
  }

  // --------------------------------------------------
  // REMOVE ITEM
  // --------------------------------------------------

  function removeItem(
    productId,
    size,
    color,
    furSelected = false
  ) {
    const selectedFur = Boolean(furSelected);

    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.size === size &&
            item.color === color &&
            Boolean(item.furSelected) === selectedFur
          )
      )
    );

    setCouponCode("");
    setDiscount(0);
    setShippingCost(0);
    setTotal(0);
    setCouponError("");
  }

  // --------------------------------------------------
  // APPLY COUPON
  // --------------------------------------------------

  async function applyCoupon(code) {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponError("Kupon kodu girin.");
      return false;
    }

    setCouponCode(normalizedCode);
    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: normalizedCode,
          subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponCode("");
        setDiscount(0);
        setShippingCost(0);
        setTotal(subtotal);

        setCouponError(
          data.error || "Kupon kodu geçersiz."
        );

        return false;
      }

      setCouponCode(data.couponCode);
      setDiscount(Number(data.discount) || 0);
      setShippingCost(Number(data.shippingCost) || 0);
      setTotal(Number(data.total) || 0);

      return true;
    } catch (error) {
      console.error("Kupon hatası:", error);

      setCouponError(
        "Kupon kontrol edilirken bir hata oluştu."
      );

      return false;
    } finally {
      setCouponLoading(false);
    }
  }

  // --------------------------------------------------
  // REMOVE COUPON
  // --------------------------------------------------

  function removeCoupon() {
    setCouponCode("");
    setDiscount(0);
    setShippingCost(0);
    setTotal(subtotal);
    setCouponError("");
  }

  // --------------------------------------------------
  // CLEAR CART
  // --------------------------------------------------

  function clearCart() {
    setItems([]);
    setCouponCode("");
    setDiscount(0);
    setShippingCost(0);
    setTotal(0);
    setCouponError("");
  }

  // --------------------------------------------------
  // ITEM COUNT
  // --------------------------------------------------

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // --------------------------------------------------
  // CONTEXT
  // --------------------------------------------------

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

        furPrice: FUR_PRICE,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }

  return ctx;
}
