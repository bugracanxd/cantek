"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const res = await signIn("credentials", {
    email: form.email,
    password: form.password,
    callbackUrl: "/admin",
    redirect: true,
  });

  setLoading(false);

  if (res?.error) {
    toast.error("E-posta veya şifre hatalı");
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold mb-2">CANTEK Admin</h1>
        <input
          type="email"
          placeholder="E-posta"
          required
          className="w-full border px-4 py-3 rounded-lg"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Şifre"
          required
          className="w-full border px-4 py-3 rounded-lg"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50">
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}
