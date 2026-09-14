"use client";

import { useEffect, useState } from "react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch("/api/admin/customers").then((r) => r.json()).then((d) => setCustomers(d.customers || []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Müşteriler</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="p-3">Ad</th><th className="p-3">E-posta</th><th className="p-3">Sipariş Sayısı</th><th className="p-3">Kayıt Tarihi</th></tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c._count.orders}</td>
                <td className="p-3">{new Date(c.createdAt).toLocaleDateString("tr-TR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
