"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductDetail({ product }) {
  const sizes = JSON.parse(product.sizes || "[]");
  const colors = JSON.parse(product.colors || "[]");
  const images = product.images.length ? product.images : [{ url: "/uploads/product-placeholder.svg" }];

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(sizes[0] || "");
  const [color, setColor] = useState(colors[0] || "");
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();

  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;

  function handleAddToCart() {
    if (sizes.length && !size) {
      toast.error("Lütfen beden seçin");
      return;
    }
    addItem(product, size, color, 1);
    toast.success("Sepete eklendi");
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
  <div className="bg-[#F8F7F4]">
    <div className="site-container py-16 grid md:grid-cols-2 gap-16">
      <div>
        <motion.div
          key={activeImage}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="aspect-[4/5] bg-[#F4F1EA] rounded-[32px] overflow-hidden mb-5 product-image-zoom shadow-[0_30px_70px_rgba(0,0,0,0.08)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[activeImage].url} alt={product.name} className="w-full h-full object-cover" />
        </motion.div>
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-16 rounded overflow-hidden border-2 transition-colors duration-200 ${i === activeImage ? "border-black" : "border-transparent hover:border-gray-300"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 mb-3">
  CANTEK
</p>
        <h1 className="font-heading text-5xl md:text-6xl leading-tight font-semibold mb-2">{product.name}</h1>
        <p className="text-gray-500 mb-4 text-sm tracking-wide uppercase">{product.category?.name}</p>

        <div className="flex items-center gap-3 mb-7">
          {hasDiscount ? (
            <>
              <span className="text-4xl font-bold font-semibold">{product.discountedPrice.toFixed(2)} ₺</span>
              <span className="text-gray-400 line-through text-base">{product.price.toFixed(2)} ₺</span>
            </>
          ) : (
            <span className="text-2xl font-semibold">{product.price.toFixed(2)} ₺</span>
          )}
        </div>

        {sizes.length > 0 && (
          <div className="mb-5">
            <div className="text-sm font-medium mb-2">Beden</div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
  key={s}
  onClick={() => setSize(s)}
  className={`w-14 h-14 border rounded-xl text-sm font-medium flex items-center justify-center transition-all duration-200 ${
  size === s
    ? "bg-black text-white border-black scale-105"
    : "bg-white border-[#D8D0C2] hover:border-black"
}`}
>
  {s}
</button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div className="mb-7">
            <div className="text-sm font-medium mb-2">Renk</div>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-5 py-3 rounded-full border rounded-site text-sm transition-all duration-150 ${
                    color === c ? "bg-black text-white border-black scale-105" : "hover:border-black"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="btn-primary w-full py-3.5 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <AnimatePresence mode="wait">
            {justAdded ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex items-center gap-2"
              >
                <Check size={18} /> Eklendi
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex items-center gap-2"
              >
                <ShoppingBag size={18} />
                {product.stock > 0 ? "Sepete Ekle" : "Stokta Yok"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

              <div className="mt-8 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
<div className="mt-10 space-y-4">

  <div className="rounded-[22px] border border-[#E7E0D4] bg-white p-5">
    <p className="font-semibold text-[#111111]">
      3-5 İş Gününde Kargoya Teslim
    </p>

    <p className="mt-2 text-sm text-neutral-600">
      Siparişiniz özenle hazırlanarak kısa sürede kargoya teslim edilir.
    </p>
  </div>

  <div className="rounded-[22px] border border-[#E7E0D4] bg-white p-5">
    <p className="font-semibold text-[#111111]">
      Hakiki Deri Garantisi
    </p>

    <p className="mt-2 text-sm text-neutral-600">
      Premium hakiki deri ve özenli el işçiliğiyle üretilmiştir.
    </p>
  </div>

</div>
        {product.description}
      </div>
    </div>
  </div>
</div>
);
}
