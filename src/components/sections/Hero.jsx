"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero({ data }) {
  return (
    <section className="relative overflow-hidden bg-[#F8F7F4] text-[#111111]">
      {/* Arka plan ışık efektleri */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-[-120px] h-[420px] w-[420px] rounded-full bg-[#EFE6DB] blur-3xl opacity-70" />
        <div className="absolute bottom-[-120px] left-[-80px] h-[260px] w-[260px] rounded-full bg-white blur-3xl opacity-80" />
      </div>

      <div className="site-container relative z-10 py-10 md:py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* MOBİLDE GÖRSEL ÖNCE */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="order-1 md:order-2"
          >
            <div className="relative rounded-[34px] bg-[#EFE6DB] p-4 md:p-7 shadow-[0_30px_80px_rgba(0,0,0,.08)]">
              <div className="aspect-[4/5] overflow-hidden rounded-[26px] bg-[#F7F2EA] flex items-center justify-center">
                <img
                  src={data.image?.trim() ? data.image : "/hero-shoe.jpg"}
                  alt="CANTEK Hero"
                  className="w-[96%] h-[96%] object-contain scale-125"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/hero-shoe.jpg";
                  }}
                />
              </div>

              <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 backdrop-blur px-4 py-2 shadow-lg">
                <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
                  CANTEK
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Hakiki Deri • Premium İşçilik
                </p>
              </div>
            </div>
          </motion.div>

          {/* YAZILAR */}
          <div className="order-2 md:order-1">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-[0.35em] text-neutral-500"
            >
              CANTEK SHOES
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl md:text-6xl font-black leading-[0.95]"
            >
              İz Bırakan Adımlar.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-base md:text-lg leading-8 text-neutral-600"
            >
              {data.subtitle ||
                "Hakiki deri, üstün işçilik ve zamansız tasarımın buluştuğu premium erkek ayakkabı koleksiyonu."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <a
                href="/category/erkek-ayakkabi"
                className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-7 py-3 text-white transition hover:scale-[1.02]"
              >
                Koleksiyonu İncele
                <ArrowRight size={18} />
              </a>
            </motion.div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-neutral-200 pt-6">
              <div>
                <p className="text-xl md:text-2xl font-bold">100%</p>
                <p className="text-xs md:text-sm text-neutral-500">
                  Hakiki Deri
                </p>
              </div>

              <div>
                <p className="text-xl md:text-2xl font-bold">El</p>
                <p className="text-xs md:text-sm text-neutral-500">
                  İşçiliği
                </p>
              </div>

              <div>
                <p className="text-xl md:text-2xl font-bold">3-5</p>
                <p className="text-xs md:text-sm text-neutral-500">
                  İş Günü Kargo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
