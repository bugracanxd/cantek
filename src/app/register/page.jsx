"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error || "Bir hata oluştu");
      return;
    }
    toast.success("Kayıt başarılı, giriş yapabilirsiniz");
    router.push("/login");
  }

  return (
    <div className="site-container py-16 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-6">Kayıt Ol</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Ad Soyad"
          required
          className="w-full border px-4 py-3 rounded-site"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="E-posta"
          required
          className="w-full border px-4 py-3 rounded-site"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Şifre"
          required
          className="w-full border px-4 py-3 rounded-site"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button disabled={loading} className="btn-primary w-full py-3 font-medium disabled:opacity-50">
          {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        Zaten hesabınız var mı? <Link href="/login" className="underline">Giriş yapın</Link>
      </p>
    </div>
  );
}
