"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const FUR_PRICE = 500;

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

  // Kupon state'i değişince input da otomatik güncellensin
  useEffect(() => {
    setCode(couponCode);
  }, [couponCode]);

  if (!hydrated) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="site-container py-24 text-center">
        <ShoppingBag
          size={40}
          className="mx-auto mb-4 text-gray-300"
          strokeWidth={1.25}
        />

        <h1 className="font-heading mb-4 text-2xl font-semibold">
          Sepetiniz boş
        </h1>

        <Link
          href="/products"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3"
        >
          Alışverişe Başla
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="site-container grid gap-10 py-10 md:grid-cols-3">
      {/* =========================
          CART ITEMS
      ========================== */}
      <div className="space-y-4 md:col-span-2">
        <h1 className="font-heading mb-4 text-2xl font-semibold">
          Sepetim
        </h1>

        <AnimatePresence>
          {items.map((item) => {
            const furSelected = Boolean(item.furSelected);

            return (
              <motion.div
                key={`${item.productId}-${item.size}-${item.color}-${furSelected ? "fur" : "standard"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="
                  flex
                  gap-4
                  border-b
                  pb-4
                "
              >
                {/* PRODUCT IMAGE */}
                <img
                  src={
                    item.image ||
                    "/uploads/product-placeholder.svg"
                  }
                  alt={item.name}
                  className="
                    h-24
                    w-24
                    shrink-0
                    rounded-site
                    object-cover
                  "
                />

                {/* PRODUCT INFO */}
                <div className="min-w-0 flex-1">
                  <div className="font-medium">
                    {item.name}
                  </div>

                  {/* SIZE / COLOR */}
                  <div className="mt-1 text-sm text-gray-500">
                    {item.size && `Beden: ${item.size}`}{" "}
                    {item.color && `· Renk: ${item.color}`}
                  </div>

                  {/* FUR OPTION */}
                  {furSelected && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#F7F5F1] px-3 py-1 text-xs font-medium text-[#222]">
                      <Check size={13} strokeWidth={2.5} />
                      Kürklü
                      <span className="text-gray-500">
                        +{FUR_PRICE.toFixed(2)} ₺
                      </span>
                    </div>
                  )}

                  {/* QUANTITY + REMOVE */}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-site border">
                      <button
                        type="button"
                        aria-label="Adet azalt"
                        className="
                          px-2.5
                          py-1.5
                          transition-colors
                          hover:bg-gray-50
                        "
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            item.quantity - 1,
                            furSelected
                          )
                        }
                      >
                        <Minus size={13} />
                      </button>

                      <span className="px-3 text-sm">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label="Adet artır"
                        className="
                          px-2.5
                          py-1.5
                          transition-colors
                          hover:bg-gray-50
                        "
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            item.quantity + 1,
                            furSelected
                          )
                        }
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="
                        flex
                        items-center
                        gap-1
                        text-sm
                        text-red-600
                        transition-opacity
                        hover:opacity-70
                      "
                      onClick={() =>
                        removeItem(
                          item.productId,
                          item.size,
                          item.color,
                          furSelected
                        )
                      }
                    >
                      <Trash2 size={14} />
                      Kaldır
                    </button>
                  </div>
                </div>

                {/* ITEM PRICE */}
                <div className="shrink-0 text-right font-semibold">
                  {(Number(item.price || 0) * item.quantity).toFixed(2)} ₺

                  {furSelected && (
                    <div className="mt-1 text-xs font-normal text-gray-500">
                      Kürklü seçenek dahil
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* =========================
          ORDER SUMMARY
      ========================== */}
      <div className="h-fit rounded-site border p-6">
        <h2 className="mb-4 font-semibold">
          Sipariş Özeti
        </h2>

        {/* COUPON */}
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            placeholder="Kupon kodu"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase())
            }
            className="
              flex-1
              rounded-site
              border
              px-3
              py-2
              text-sm
              outline-none
              transition
              focus:border-black
            "
          />

          <button
            type="button"
            onClick={() => applyCoupon(code)}
            disabled={couponLoading}
            className="
              btn-primary
              px-4
              text-sm
              disabled:opacity-50
            "
          >
            {couponLoading ? "..." : "Uygula"}
          </button>
        </div>

        {/* COUPON ERROR */}
        {couponError && (
          <p className="mb-3 text-xs text-red-600">
            {couponError}
          </p>
        )}

        {/* ACTIVE COUPON */}
        {couponCode && (
          <div className="mb-3 flex justify-between text-sm text-green-600">
            <span>✓ {couponCode}</span>

            <button
              type="button"
              onClick={removeCoupon}
              className="underline"
            >
              Kaldır
            </button>
          </div>
        )}

        {/* SUBTOTAL */}
        <div className="mb-2 flex justify-between">
          <span>Ara Toplam</span>

          <span>
            {subtotal.toFixed(2)} ₺
          </span>
        </div>

        {/* DISCOUNT */}
        {discount > 0 && (
          <div className="mb-2 flex justify-between text-green-600">
            <span>İndirim</span>

            <span>
              -{discount.toFixed(2)} ₺
            </span>
          </div>
        )}

        {/* SHIPPING */}
        <div className="mb-2 flex justify-between">
          <span>Kargo</span>

          <span>
            {shippingCost.toFixed(2)} ₺
          </span>
        </div>

        {/* TOTAL */}
        <div className="mt-3 flex justify-between border-t pt-3 text-lg font-semibold">
          <span>Toplam</span>

          <span>
            {(couponCode ? total : subtotal).toFixed(2)} ₺
          </span>
        </div>

        {/* CHECKOUT */}
        <Link
          href="/checkout"
          className="
            btn-primary
            mt-5
            flex
            w-full
            items-center
            justify-center
            gap-2
            py-3
            font-medium
          "
        >
          Ödemeye Geç
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
