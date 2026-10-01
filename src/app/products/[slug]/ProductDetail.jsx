"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

  const images = product.images?.length
    ? product.images
    : [{ url: "/uploads/product-placeholder.svg" }];

  const categoryText = product.categories?.length
    ? product.categories
        .map((c) => c.category?.name)
        .filter(Boolean)
        .join(" • ")
    : "";

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(sizes[0] || "");
  const [color, setColor] = useState(colors[0] || "");
  const [justAdded, setJustAdded] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const { addItem } = useCart();

  const hasDiscount =
    product.discountedPrice && product.discountedPrice < product.price;

  function prevImage() {
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function nextImage() {
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  function handleTouchStart(e) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchEnd(e) {
    if (touchStart === null) return;

    const diff = touchStart - e.changedTouches[0].clientX;

    if (Math.abs(diff) > 50) {
      diff > 0 ? nextImage() : prevImage();
    }

    setTouchStart(null);
  }

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
    <div className="bg-white">
      <div className="site-container grid gap-12 py-8 md:grid-cols-2 md:gap-16 md:py-16">
        {/* =========================
            PRODUCT IMAGES
        ========================== */}
        <div className="min-w-0">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="
              relative
              mb-4
              aspect-[4/3]
              overflow-hidden
              rounded-[24px]
              bg-[#F7F7F7]
              md:mb-5
              md:aspect-[4/3]
              md:rounded-[32px]
              md:shadow-[0_30px_70px_rgba(0,0,0,0.06)]
            "
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeImage].url}
              alt={product.name}
              draggable={false}
              className="
                h-full
                w-full
                select-none
                object-contain
                p-2
                md:p-4
              "
            />

            {images.length > 1 && (
              <>
                {/* LEFT ARROW */}
                <button
                  onClick={prevImage}
                  aria-label="Önceki ürün görseli"
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-white/90
                    p-2.5
                    shadow-sm
                    backdrop-blur-md
                    transition
                    hover:scale-105
                    hover:bg-white
                    md:left-4
                    md:p-3
                  "
                >
                  <ChevronLeft size={20} />
                </button>

                {/* RIGHT ARROW */}
                <button
                  onClick={nextImage}
                  aria-label="Sonraki ürün görseli"
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-white/90
                    p-2.5
                    shadow-sm
                    backdrop-blur-md
                    transition
                    hover:scale-105
                    hover:bg-white
                    md:right-4
                    md:p-3
                  "
                >
                  <ChevronRight size={20} />
                </button>

                {/* DOTS */}
                <div
                  className="
                    absolute
                    bottom-3
                    left-1/2
                    flex
                    -translate-x-1/2
                    gap-1.5
                    rounded-full
                    bg-black/15
                    px-2.5
                    py-1.5
                    backdrop-blur-md
                    md:bottom-4
                    md:gap-2
                    md:px-3
                    md:py-2
                  "
                >
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all md:h-2 ${
                        i === activeImage
                          ? "w-4 bg-white md:w-5"
                          : "w-1.5 bg-white/50 md:w-2"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* THUMBNAILS */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 md:gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Ürün görseli ${i + 1}`}
                  className={`
                    h-16
                    w-16
                    shrink-0
                    overflow-hidden
                    rounded-xl
                    border-2
                    bg-[#F7F7F7]
                    transition-all
                    md:h-[76px]
                    md:w-[76px]
                    md:rounded-2xl
                    ${
                      i === activeImage
                        ? "scale-[1.03] border-black"
                        : "border-transparent hover:border-gray-300"
                    }
                  `}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* =========================
            PRODUCT INFO
        ========================== */}
        <div className="min-w-0">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-neutral-500">
            CANTEK
          </p>

          <h1 className="font-heading mb-2 text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            {product.name}
          </h1>

          {categoryText && (
            <p className="mb-4 text-sm uppercase tracking-wide text-gray-500">
              {categoryText}
            </p>
          )}

          {/* PRICE */}
          <div className="mb-7 flex items-center gap-3">
            {hasDiscount ? (
              <>
                <span className="text-3xl font-bold md:text-4xl">
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

          {/* SIZE */}
          {sizes.length > 0 && (
            <div className="mb-5">
              <div className="mb-2 text-sm font-medium">Beden</div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-xl
                      border
                      text-sm
                      font-medium
                      transition-all
                      ${
                        size === s
                          ? "scale-105 border-black bg-black text-white"
                          : "border-[#D8D0C2] bg-white hover:border-black"
                      }
                    `}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COLOR */}
          {colors.length > 0 && (
            <div className="mb-7">
              <div className="mb-2 text-sm font-medium">Renk</div>

              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`
                      rounded-full
                      border
                      px-5
                      py-3
                      text-sm
                      transition-all
                      ${
                        color === c
                          ? "scale-105 border-black bg-black text-white"
                          : "bg-white hover:border-black"
                      }
                    `}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ADD TO CART */}
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
                  <Check size={18} />
                  Eklendi
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

          {/* INFO BOXES */}
          <div className="mt-8 space-y-4 md:mt-10">
            <div className="rounded-[22px] border border-[#E7E0D4] bg-white p-5">
              <p className="font-semibold text-[#111111]">
                3-5 İş Gününde Kargoya Teslim
              </p>

              <p className="mt-2 text-sm text-neutral-600">
                Siparişiniz özenle hazırlanarak kısa sürede kargoya teslim
                edilir.
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

          {/* DESCRIPTION */}
          <div className="mt-8 whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {product.description}
          </div>
        </div>
      </div>
    </div>
  );
}
