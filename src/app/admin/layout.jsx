"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Folder,
  Images,
  Menu,
  Settings,
  CircleUser,
  TicketPercent,
  LogOut,
  Store,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Ürünler", icon: Package },
  { href: "/admin/orders", label: "Siparişler", icon: ShoppingBag },
  { href: "/admin/categories", label: "Kategoriler", icon: Folder },
  { href: "/admin/banners", label: "Bannerlar", icon: Images },
  { href: "/admin/menu", label: "Menüler", icon: Menu },
  { href: "/admin/coupons", label: "Kuponlar", icon: TicketPercent },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">
      <aside className="w-72 bg-[#0A0A0A] text-white p-5 flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl bg-white text-black flex items-center justify-center">
            <Store size={22} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide">CANTEK</h1>
            <p className="text-xs text-zinc-400">Premium Admin</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {links.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-white text-black shadow-lg scale-[1.02]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 pt-4">
          <div className="flex items-center gap-3 bg-zinc-900 rounded-2xl p-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center">
              <CircleUser size={22} />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-sm">Admin</p>
              <p className="text-xs text-zinc-400">Çevrimiçi</p>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition">
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
