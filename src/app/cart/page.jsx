"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, hydrated } = useCart();

  if (hydrated && items.length === 0) {
    return (
      <div className="site-container py-24 text-center">
        <ShoppingBag size={40} className="mx-auto mb-4 text-gray-300" strokeWidth={1.25} />
        <h1 className="font-heading text-2xl font-semibold mb-4">Sepetiniz boş</h1>
        <Link href="/products" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
          Alışverişe Başla <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="site-container py-10 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2 space-y-4">
        <h1 className="font-heading text-2xl font-semibold mb-4">Sepetim</h1>
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              key={`${item.productId}-${item.size}-${item.color}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="flex gap-4 border-b pb-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image || "/uploads/product-placeholder.svg"} alt={item.name} className="w-24 h-24 object-cover rounded-site" />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">
                  {item.size && `Beden: ${item.size}`} {item.color && `· Renk: ${item.color}`}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border rounded-site overflow-hidden">
                    <button
                      className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      aria-label="Azalt"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      aria-label="Artır"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <button
                    className="text-sm text-red-600 flex items-center gap-1 hover:opacity-70 transition-opacity"
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                  >
                    <Trash2 size={14} /> Kaldır
                  </button>
                </div>
              </div>
              <div className="font-semibold">{(item.price * item.quantity).toFixed(2)} ₺</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="border rounded-site p-6 h-fit">
        <div className="flex justify-between mb-2">
          <span>Ara Toplam</span>
          <span>{subtotal.toFixed(2)} ₺</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">Kargo ücreti ve indirimler ödeme adımında hesaplanır.</p>
        <Link href="/checkout" className="btn-primary flex items-center justify-center gap-2 w-full py-3 font-medium">
          Ödemeye Geç <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
