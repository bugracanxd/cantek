"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ProductCard({ product, index = 0 }) {
  const img = product.images?.[0]?.url || "/uploads/product-placeholder.svg";
  const hasDiscount =
    product.discountedPrice && product.discountedPrice < product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="overflow-hidden rounded-[28px] bg-[#F4F1EA] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl">

          {/* Görsel */}
          <div className="relative aspect-[4/5] overflow-hidden bg-[#F4F1EA]">
            <img
              src={img}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            />

            {product.isNew && (
              <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-black px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white">
                <Sparkles size={11} />
                Yeni
              </span>
            )}

            {product.isBestSeller && (
              <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-medium shadow">
                Çok Satan
              </span>
            )}
          </div>

          {/* Bilgiler */}
          <div className="p-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-400">
              CANTEK
            </p>

            <h3 className="mt-2 text-lg font-semibold leading-snug">
              {product.name}
            </h3>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                {hasDiscount ? (
                  <>
                    <p className="text-xl font-bold">
                      {product.discountedPrice.toFixed(2)} ₺
                    </p>
                    <p className="text-sm text-neutral-400 line-through">
                      {product.price.toFixed(2)} ₺
                    </p>
                  </>
                ) : (
                  <p className="text-xl font-bold">
                    {product.price.toFixed(2)} ₺
                  </p>
                )}
              </div>

              <div className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:border-black">
                İncele
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
