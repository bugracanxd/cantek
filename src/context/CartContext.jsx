"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cantek_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      // sepet okunamazsa sessizce boş başlat
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(product, size, color, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && i.size === size && i.color === color
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + quantity } : i
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
          i.productId === productId && i.size === size && i.color === color
            ? { ...i, quantity }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(productId, size, color) {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && i.size === size && i.color === color)
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, subtotal, itemCount, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
