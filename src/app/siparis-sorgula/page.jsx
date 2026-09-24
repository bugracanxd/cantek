"use client";

import { useState } from "react";

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!orderNumber.trim()) {
      alert("Lütfen sipariş numaranızı girin.");
      return;
    }

    // Bir sonraki aşamada buradan API'ye bağlanacağız.
    console.log("Sipariş numarası:", orderNumber);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl text-center">
          <div className="mb-6 text-5xl">📦</div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Sipariş Sorgulama
          </h1>

          <p className="mt-3 text-gray-500">
            Siparişinizin durumunu görmek için sipariş numaranızı girin.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="text-left">
              <label
                htmlFor="orderNumber"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Sipariş Numarası
              </label>

              <input
                id="orderNumber"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Örn: CTK-123456"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Siparişi Sorgula
            </button>
          </form>

          <p className="mt-5 text-sm text-gray-400">
            Sipariş numaranızı sipariş onay e-postanızda bulabilirsiniz.
          </p>
        </div>
      </div>
    </main>
  );
}
