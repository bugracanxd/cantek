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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F5F7]">
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col bg-[#0A0A0A] p-5 text-white shadow-2xl lg:flex">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-black">
            <Store size={22} />
          </div>

          <div className="min-w-0">
            <h1 className="font-bold tracking-wide">CANTEK</h1>
            <p className="text-xs text-zinc-400">Premium Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                  active
                    ? "scale-[1.02] bg-white text-black shadow-lg"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon size={20} className="shrink-0" />

                <span className="font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-zinc-800 pt-4">
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-zinc-900 p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black">
              <CircleUser size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm">Admin</p>
              <p className="text-xs text-zinc-400">Çevrimiçi</p>
            </div>
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-zinc-400 transition hover:bg-zinc-900 hover:text-white">
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur lg:hidden">
        {/* Top bar */}
        <div className="flex h-16 w-full items-center justify-between px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
              <Store size={18} />
            </div>

            <div>
              <p className="text-sm font-bold tracking-wide text-gray-950">
                CANTEK
              </p>
              <p className="text-[10px] text-gray-400">
                Premium Admin
              </p>
            </div>
          </Link>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700">
            <CircleUser size={19} />
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="w-full overflow-x-auto border-t border-gray-100">
          <nav className="flex w-max min-w-full gap-2 px-4 py-2.5">
            {links.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${
                    active
                      ? "bg-black text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 active:bg-gray-200"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* CONTENT */}
      <main className="w-full min-w-0 lg:ml-72">
        <div className="w-full min-w-0 p-3 sm:p-5 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
