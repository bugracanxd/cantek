"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero({ data }) {
  return (
    <section className="relative overflow-hidden bg-[#F8F7F4] text-[#111111]">
      {/* Soft ışık */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-[-120px] h-[420px] w-[420px] rounded-full bg-[#EFE6DB] blur-3xl opacity-70" />
        <div className="absolute bottom-[-120px] left-[-80px] h-[260px] w-[260px] rounded-full bg-white blur-3xl opacity-80" />
      </div>

      <div className="site-container relative z-10 py-10 md:py-20">
        <div className="grid gap-12 items-center md:grid-cols-2">
          {/* SOL */}
          <div className="order-2 md:order-1">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs tracking-[0.35em] uppercase text-neutral-500"
            >
              CANTEK SHOES
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl md:text-6xl font-black leading-[0.95]"
            >
              İz Bırakan Adımlar.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-base md:text-lg leading-8 text-neutral-600"
            >
              {data.subtitle ||
                "Hakiki deri, üstün işçilik ve zamansız tasarımın buluştuğu premium erkek ayakkabı koleksiyonu."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <a
                href="/category/erkek-ayakkabi"
                className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-7 py-3 text-white hover:scale-[1.02] transition"
              >
                Koleksiyonu İncele
                <ArrowRight size={18} />
              </a>
            </motion.div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-neutral-200 pt-6">
              <div>
                <p className="text-xl md:text-2xl font-bold">100%</p>
                <p className="text-xs md:text-sm text-neutral-500">Hakiki Deri</p>
              </div>

              <div>
                <p className="text-xl md:text-2xl font-bold">El</p>
                <p className="text-xs md:text-sm text-neutral-500">İşçiliği</p>
              </div>

              <div>
                <p className="text-xl md:text-2xl font-bold">3-5</p>
                <p className="text-xs md:text-sm text-neutral-500">İş Günü Kargo</p>
              </div>
            </div>
          </div>

          {/* SAĞ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="order-1 md:order-2"
          >
            <div className="relative rounded-[36px] bg-[#EFE6DB] p-4 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.10)]">
              <div className="aspect-[4/5] rounded-[28px] bg-[#F5F2EA] overflow-hidden flex items-center justify-center">
                <img
                  src={data.image?.trim() ? data.image : "/hero-shoe.jpg"}
                  alt="CANTEK Hero"
                  className="w-[92%] h-[92%] object-contain rotate-[-8deg] scale-110"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/hero-shoe.jpg";
                  }}
                />
              </div>

              <div className="absolute bottom-5 left-5 rounded-2xl bg-white/95 backdrop-blur px-5 py-3 shadow-xl">
                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  CANTEK
                </p>
                <p className="mt-1 text-sm md:text-base font-semibold">
                  Hakiki Deri • Premium İşçilik
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
