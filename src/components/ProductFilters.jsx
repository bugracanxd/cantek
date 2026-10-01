"use client";

import { useEffect, useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProductFilters({
  categories = [],
  sizes = [],
  colors = [],
  currentFilters = {},
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);

  const [category, setCategory] = useState(
    currentFilters.category || ""
  );

  const [selectedSizes, setSelectedSizes] = useState(
    currentFilters.size
      ? currentFilters.size.split(",").filter(Boolean)
      : []
  );

  const [selectedColors, setSelectedColors] = useState(
    currentFilters.color
      ? currentFilters.color.split(",").filter(Boolean)
      : []
  );

  const [sort, setSort] = useState(
    currentFilters.sort || ""
  );

  useEffect(() => {
    setCategory(currentFilters.category || "");

    setSelectedSizes(
      currentFilters.size
        ? currentFilters.size.split(",").filter(Boolean)
        : []
    );

    setSelectedColors(
      currentFilters.color
        ? currentFilters.color.split(",").filter(Boolean)
        : []
    );

    setSort(currentFilters.sort || "");
  }, [
    currentFilters.category,
    currentFilters.size,
    currentFilters.color,
    currentFilters.sort,
  ]);

  // ---------------- SIZE TOGGLE ----------------

  function toggleSize(size) {
    setSelectedSizes((current) => {
      if (current.includes(size)) {
        return current.filter((item) => item !== size);
      }

      return [...current, size];
    });
  }

  // ---------------- COLOR TOGGLE ----------------

  function toggleColor(color) {
    setSelectedColors((current) => {
      if (current.includes(color)) {
        return current.filter((item) => item !== color);
      }

      return [...current, color];
    });
  }

  // ---------------- APPLY ----------------

  function applyFilters() {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    // CATEGORY
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    // SIZES
    if (selectedSizes.length > 0) {
      params.set(
        "size",
        selectedSizes.join(",")
      );
    } else {
      params.delete("size");
    }

    // COLORS
    if (selectedColors.length > 0) {
      params.set(
        "color",
        selectedColors.join(",")
      );
    } else {
      params.delete("color");
    }

    // SORT
    if (sort) {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }

    const query = params.toString();

    router.push(
      query
        ? `/products?${query}`
        : "/products"
    );

    setOpen(false);
  }

  // ---------------- CLEAR ----------------

  function clearFilters() {
    setCategory("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setSort("");

    router.push("/products");

    setOpen(false);
  }

  const activeCount =
    (category ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (sort ? 1 : 0);

  return (
    <>
      {/* FILTER BUTTON */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-gray-300 bg-white text-sm font-medium hover:border-black transition-colors"
      >
        <Filter
          size={17}
          strokeWidth={1.8}
        />

        Filtrele

        {activeCount > 0 && (
          <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-black text-white text-xs">
            {activeCount}
          </span>
        )}
      </button>

      {/* OVERLAY */}

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* FILTER PANEL */}

      <div
        className={`fixed z-[110] top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl transition-transform duration-300 ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">

          {/* HEADER */}

          <div className="flex items-center justify-between px-6 py-5 border-b">

            <div>
              <h2 className="font-heading text-xl font-semibold">
                Filtrele
              </h2>

              {activeCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {activeCount} filtre aktif
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50"
              aria-label="Filtreleri kapat"
            >
              <X size={19} />
            </button>

          </div>

          {/* CONTENT */}

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

            {/* CATEGORY */}

            <section>
              <label className="block text-sm font-semibold mb-3">
                Kategori
              </label>

              <div className="relative">

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm bg-white outline-none focus:border-black"
                >
                  <option value="">
                    Tüm kategoriler
                  </option>

                  {categories.map((item) => (
                    <option
                      key={item.id}
                      value={item.slug}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                />

              </div>
            </section>

            {/* SIZE */}

            <section>

              <label className="block text-sm font-semibold mb-3">
                Beden
              </label>

              {sizes.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Kullanılabilir beden bulunamadı.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">

                  {sizes.map((item) => {

                    const selected =
                      selectedSizes.includes(item);

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          toggleSize(item)
                        }
                        className={`h-11 rounded-xl border text-sm transition-colors ${
                          selected
                            ? "bg-black text-white border-black"
                            : "bg-white border-gray-300 hover:border-black"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}

                </div>
              )}

              {selectedSizes.length > 0 && (
                <p className="text-xs text-gray-500 mt-3">
                  {selectedSizes.length} beden seçildi
                </p>
              )}

            </section>

            {/* COLOR */}

            <section>

              <label className="block text-sm font-semibold mb-3">
                Renk
              </label>

              {colors.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Kullanılabilir renk bulunamadı.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">

                  {colors.map((item) => {

                    const selected =
                      selectedColors.includes(item);

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          toggleColor(item)
                        }
                        className={`px-4 py-2.5 rounded-full border text-sm transition-colors ${
                          selected
                            ? "bg-black text-white border-black"
                            : "bg-white border-gray-300 hover:border-black"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}

                </div>
              )}

              {selectedColors.length > 0 && (
                <p className="text-xs text-gray-500 mt-3">
                  {selectedColors.length} renk seçildi
                </p>
              )}

            </section>

            {/* SORT */}

            <section>

              <label className="block text-sm font-semibold mb-3">
                Sıralama
              </label>

              <div className="space-y-2">

                {/* DEFAULT */}

                <button
                  type="button"
                  onClick={() => setSort("")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${
                    sort === ""
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black"
                  }`}
                >
                  <span>Varsayılan</span>

                  {sort === "" && (
                    <span>✓</span>
                  )}
                </button>

                {/* LOW TO HIGH */}

                <button
                  type="button"
                  onClick={() =>
                    setSort("price-asc")
                  }
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${
                    sort === "price-asc"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black"
                  }`}
                >
                  <span>
                    Fiyat: Düşükten Yükseğe
                  </span>

                  {sort === "price-asc" && (
                    <span>✓</span>
                  )}
                </button>

                {/* HIGH TO LOW */}

                <button
                  type="button"
                  onClick={() =>
                    setSort("price-desc")
                  }
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${
                    sort === "price-desc"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black"
                  }`}
                >
                  <span>
                    Fiyat: Yüksekten Düşüğe
                  </span>

                  {sort === "price-desc" && (
                    <span>✓</span>
                  )}
                </button>

              </div>

            </section>

          </div>

          {/* FOOTER */}

          <div className="border-t bg-white px-6 py-5 space-y-3">

            <button
              type="button"
              onClick={applyFilters}
              className="w-full py-3.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Ürünleri Göster
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="w-full py-3.5 rounded-full border border-gray-300 text-sm font-medium hover:border-black transition-colors"
            >
              Filtreleri Temizle
            </button>

          </div>

        </div>
      </div>
    </>
  );
}
