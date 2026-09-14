"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { ...form, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("E-posta veya şifre hatalı");
    } else {
      toast.success("Giriş başarılı");
      router.push("/account");
    }
  }

  return (
    <div className="site-container py-16 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-6">Giriş Yap</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        Hesabınız yok mu? <Link href="/register" className="underline">Kayıt olun</Link>
      </p>
    </div>
  );
}
