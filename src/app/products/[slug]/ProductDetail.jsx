"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductDetail({ product }) {
  const sizes =
    typeof product.sizes === "string"
      ? JSON.parse(product.sizes || "[]")
      : product.sizes || [];

  const colors =
    typeof product.colors === "string"
      ? JSON.parse(product.colors || "[]")
      : product.colors || [];

  const images =
    product.images?.length
      ? product.images
      : [{ url: "/uploads/product-placeholder.svg" }];

  const categoryText =
    product.categories?.length
      ? product.categories
          .map((c) => c.category?.name)
          .filter(Boolean)
          .join(" • ")
      : "";

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(sizes[0] || "");
  const [color, setColor] = useState(colors[0] || "");
  const [justAdded, setJustAdded] = useState(false);

  const { addItem } = useCart();

  const hasDiscount =
    product.discountedPrice && product.discountedPrice < product.price;

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
      <div className="site-container grid gap-16 py-16 md:grid-cols-2">
        <div>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="product-image-zoom mb-5 aspect-[4/5] overflow-hidden rounded-[32px] bg-[#F4F1EA] shadow-[0_30px_70px_rgba(0,0,0,0.08)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeImage].url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </motion.div>

          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded border-2 transition-colors ${
                    i === activeImage
                      ? "border-black"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-neutral-500">
            CANTEK
          </p>

          <h1 className="font-heading mb-2 text-5xl font-semibold leading-tight md:text-6xl">
            {product.name}
          </h1>

          <p className="mb-4 text-sm uppercase tracking-wide text-gray-500">
            {categoryText}
          </p>

          <div className="mb-7 flex items-center gap-3">
            {hasDiscount ? (
              <>
                <span className="text-4xl font-bold">
                  {product.discountedPrice.toFixed(2)} ₺
                </span>
                <span className="text-base text-gray-400 line-through">
                  {product.price.toFixed(2)} ₺
                </span>
              </>
            ) : (
              <span className="text-2xl font-semibold">
                {product.price.toFixed(2)} ₺
              </span>
            )}
          </div>

          {sizes.length > 0 && (
            <div className="mb-5">
              <div className="mb-2 text-sm font-medium">Beden</div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex h-14 w-14 items-center justify-center rounded-xl border text-sm font-medium transition-all ${
                      size === s
                        ? "scale-105 border-black bg-black text-white"
                        : "border-[#D8D0C2] bg-white hover:border-black"
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
              <div className="mb-2 text-sm font-medium">Renk</div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`rounded-full border px-5 py-3 text-sm transition-all ${
                      color === c
                        ? "scale-105 border-black bg-black text-white"
                        : "hover:border-black"
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
            className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 font-medium disabled:opacity-50"
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

          <div className="mt-8 whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {product.description}
          </div>
        </div>
      </div>
    </div>
  );
}
