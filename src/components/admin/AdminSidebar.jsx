"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/admin", label: "📊 Dashboard" },
  { href: "/admin/products", label: "👟 Ürünler" },
  { href: "/admin/categories", label: "🗂️ Kategoriler" },
  { href: "/admin/orders", label: "📦 Siparişler" },
  { href: "/admin/customers", label: "👥 Müşteriler" },
  { href: "/admin/coupons", label: "🏷️ Kuponlar" },
  { href: "/admin/homepage", label: "🏠 Ana Sayfa" },
  { href: "/admin/theme", label: "🎨 Site Tasarımı" },
  { href: "/admin/menus", label: "📋 Menüler" },
  { href: "/admin/banners", label: "🖼️ Bannerlar" },
  { href: "/admin/seo", label: "🔎 SEO" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-black text-white min-h-screen flex flex-col shrink-0">
      <div className="p-6 font-bold text-xl border-b border-white/10">CANTEK Admin</div>
      <nav className="flex-1 py-4">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-6 py-3 text-sm ${
              pathname === link.href ? "bg-white/10 font-medium" : "hover:bg-white/5"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="p-6 text-sm text-left border-t border-white/10 hover:bg-white/5">
        🚪 Çıkış Yap
      </button>
    </aside>
  );
}
