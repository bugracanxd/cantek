"use client";

import { motion } from "framer-motion";

export default function BrandStory() {
  return (
    <section className="bg-[#F8F7F4] py-24 border-t border-[#E7E0D4]">
      <div className="site-container grid items-center gap-16 lg:grid-cols-2">

        {/* Sol */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
            CANTEK
          </p>

          <h2 className="mt-5 font-heading text-4xl md:text-5xl font-bold leading-tight">
            Her Adım Bir Karakter Taşır.
<div className="mt-6 h-px w-24 bg-black/20" />
          </h2>

          <p className="mt-8 text-lg leading-8 text-neutral-600">
            Hakiki deri yalnızca bir malzeme değildir.
            CANTEK, zamansız tasarım ve üstün işçiliği bir araya getirerek
            yıllarca kullanılacak premium erkek ayakkabıları üretir.
          </p>

          <p className="mt-6 text-lg leading-8 text-neutral-600">
            Her model, günlük şıklığı ve modern karakteri tamamlamak için
            özenle tasarlanır.
          </p>

          <div className="mt-10 flex gap-10">

            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-neutral-500">Hakiki Deri</p>
            </div>

            <div>
              <p className="text-3xl font-bold">El</p>
              <p className="text-sm text-neutral-500">İşçiliği</p>
            </div>

          </div>
        </motion.div>

        {/* Sağ */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-[36px] bg-[#F4F1EA] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.10)]">

            <div className="aspect-[4/5] rounded-[24px] border border-dashed border-neutral-300 bg-[#F7F3EB] flex items-center justify-center">

              <div className="text-center">
                <div className="text-5xl">👞</div>

                <p className="mt-4 text-sm text-neutral-500">
                  Premium Deri Görseli
                </p>

                <p className="text-xs text-neutral-400">
                  Sonra eklenecek
                </p>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}