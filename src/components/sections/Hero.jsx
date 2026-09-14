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

      <div className="site-container relative z-10 py-16 md:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">

          {/* Sol taraf */}
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500"
            >
              CANTEK SHOES
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mt-5 text-5xl font-black leading-[0.95] md:text-6xl lg:text-7xl"
            >
              {"İz Bırakan Adımlar."}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-7 text-lg leading-8 text-neutral-600"
            >
              {data.subtitle ||
                "Hakiki deri, üstün işçilik ve zamansız tasarımın buluştuğu premium erkek ayakkabı koleksiyonu."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <a
                href="/category/erkek-ayakkabi"
                className="group inline-flex items-center gap-2 rounded-full bg-[#111111] px-8 py-4 text-white transition-all duration-300 hover:scale-[1.02]"
              >
                {"Koleksiyonu İncele"}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            </motion.div>

            {/* Alt bilgi */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-14 grid grid-cols-3 gap-6 border-t border-neutral-200 pt-8"
            >
              <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-sm text-neutral-500">Hakiki Deri</p>
              </div>

              <div>
                <p className="text-2xl font-bold">El</p>
                <p className="text-sm text-neutral-500">İşçiliği</p>
              </div>

              <div>
                <p className="text-2xl font-bold">3-5 İş Günü İçinde Kargo</p>
                <p className="text-sm text-neutral-500">Hızlı Kargo</p>
              </div>
            </motion.div>
          </div>

          {/* Sağ taraf */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[40px] bg-white shadow-[0_50px_120px_rgba(0,0,0,0.12)]" />

            <div className="relative overflow-hidden rounded-[40px] bg-[#EFE6DB] p-10">
              <div className="aspect-[4/5] flex items-center justify-center rounded-[28px] border border-dashed border-neutral-300 bg-[#F5F2EA]">
                <div className="text-center">
                  <p className="text-4xl">👞</p>
                  <p className="mt-3 text-sm text-neutral-500">
                    Hero Görseli
                  </p>
                  <p className="text-xs text-neutral-400">
                    hero-shoe.jpg sonra eklenecek
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 left-8 rounded-2xl bg-white px-6 py-4 shadow-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                CANTEK
              </p>
              <p className="mt-1 font-semibold">
                Hakiki Deri • Premium İşçilik
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
