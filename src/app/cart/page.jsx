"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    hydrated,
    couponCode,
    discount,
    shippingCost,
    total,
    applyCoupon,
    removeCoupon,
    couponLoading,
    couponError,
  } = useCart();

  const [code, setCode] = useState(couponCode);

  if (hydrated && items.length === 0) {
    return (
      <div className="site-container py-24 text-center">
        <ShoppingBag
          size={40}
          className="mx-auto mb-4 text-gray-300"
          strokeWidth={1.25}
        />
        <h1 className="font-heading text-2xl font-semibold mb-4">
          Sepetiniz boş
        </h1>

        <Link
          href="/products"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3"
        >
          Alışverişe Başla <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="site-container py-10 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2 space-y-4">
        <h1 className="font-heading text-2xl font-semibold mb-4">
          Sepetim
        </h1>

        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={`${item.productId}-${item.size}-${item.color}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="flex gap-4 border-b pb-4"
            >
              <img
                src={item.image || "/uploads/product-placeholder.svg"}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-site"
              />

              <div className="flex-1">
                <div className="font-medium">{item.name}</div>

                <div className="text-sm text-gray-500">
                  {item.size && `Beden: ${item.size}`}{" "}
                  {item.color && `· Renk: ${item.color}`}
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border rounded-site overflow-hidden">
                    <button
                      className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.color,
                          item.quantity - 1
                        )
                      }
                    >
                      <Minus size={13} />
                    </button>

                    <span className="px-3 text-sm">
                      {item.quantity}
                    </span>

                    <button
                      className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.color,
                          item.quantity + 1
                        )
                      }
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    className="text-sm text-red-600 flex items-center gap-1 hover:opacity-70 transition-opacity"
                    onClick={() =>
                      removeItem(
                        item.productId,
                        item.size,
                        item.color
                      )
                    }
                  >
                    <Trash2 size={14} /> Kaldır
                  </button>
                </div>
              </div>

              <div className="font-semibold">
                {(item.price * item.quantity).toFixed(2)} ₺
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="border rounded-site p-6 h-fit">
        <h2 className="font-semibold mb-4">Sipariş Özeti</h2>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Kupon kodu"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase())
            }
            className="flex-1 border px-3 py-2 rounded-site text-sm"
          />

          <button
            onClick={() => applyCoupon(code)}
            disabled={couponLoading}
            className="btn-primary px-4 text-sm disabled:opacity-50"
          >
            {couponLoading ? "..." : "Uygula"}
          </button>
        </div>

        {couponError && (
          <p className="text-red-600 text-xs mb-3">
            {couponError}
          </p>
        )}

        {couponCode && (
          <div className="flex justify-between text-green-600 text-sm mb-3">
            <span>✓ {couponCode}</span>

            <button
              onClick={() => {
                removeCoupon();
                setCode("");
              }}
              className="underline"
            >
              Kaldır
            </button>
          </div>
        )}

        <div className="flex justify-between mb-2">
          <span>Ara Toplam</span>
          <span>{subtotal.toFixed(2)} ₺</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between mb-2 text-green-600">
            <span>İndirim</span>
            <span>-{discount.toFixed(2)} ₺</span>
          </div>
        )}

        <div className="flex justify-between mb-2">
          <span>Kargo</span>
          <span>{shippingCost.toFixed(2)} ₺</span>
        </div>

        <div className="border-t mt-3 pt-3 flex justify-between font-semibold text-lg">
          <span>Toplam</span>
          <span>
            {(couponCode ? total : subtotal).toFixed(2)} ₺
          </span>
        </div>

        <Link
          href="/checkout"
          className="btn-primary flex items-center justify-center gap-2 w-full py-3 font-medium mt-5"
        >
          Ödemeye Geç <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
