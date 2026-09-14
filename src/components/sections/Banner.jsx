"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function BannerSection({ data }) {
  // Banner tamamen boşsa hiç render etme
  if (
    !data ||
    (!data.image &&
      !data.title &&
      !data.description &&
      !data.buttonText)
  ) {
    return null;
  }

  return (
    <section className="site-container my-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative rounded-site overflow-hidden min-h-[240px] flex items-center bg-center bg-cover text-white"
        style={{
          backgroundImage: data.image ? `url(${data.image})` : "none",
          backgroundColor: data.image ? "transparent" : "#111827",
        }}
      >
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 p-10">
          {data.title && (
            <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-2">
              {data.title}
            </h2>
          )}

          {data.description && (
            <p className="mb-5 opacity-90 font-light">{data.description}</p>
          )}

          {data.buttonText && (
            <a
              href={data.buttonLink || "#"}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm group"
            >
              {data.buttonText}
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          )}
        </div>
      </motion.div>
    </section>
  );
}
