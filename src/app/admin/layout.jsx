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
  Users,
  Home,
  LogIn,
  Search,
  Palette,
} from "lucide-react";

const links = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/products",
    label: "Ürünler",
    icon: Package,
  },
  {
    href: "/admin/orders",
    label: "Siparişler",
    icon: ShoppingBag,
  },
  {
    href: "/admin/categories",
    label: "Kategoriler",
    icon: Folder,
  },
  {
    href: "/admin/banners",
    label: "Bannerlar",
    icon: Images,
  },
  {
    href: "/admin/customers",
    label: "Müşteriler",
    icon: Users,
  },
  {
    href: "/admin/homepage",
    label: "Homepage",
    icon: Home,
  },
  {
    href: "/admin/menu",
    label: "Menüler",
    icon: Menu,
  },
  {
    href: "/admin/coupons",
    label: "Kuponlar",
    icon: TicketPercent,
  },
  {
    href: "/admin/seo",
    label: "SEO",
    icon: Search,
  },
  {
    href: "/admin/theme",
    label: "Theme",
    icon: Palette,
  },
  {
    href: "/admin/login",
    label: "Login",
    icon: LogIn,
  },
  {
    href: "/admin/settings",
    label: "Ayarlar",
    icon: Settings,
  },
];

function SidebarContent({ mobile = false }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 shrink-0">
        <div className="w-11 h-11 rounded-xl bg-white text-black flex items-center justify-center shadow-lg">
          <Store size={22} />
        </div>

        <div>
          <h1 className="font-bold text-lg tracking-wide">CANTEK</h1>
          <p className="text-xs text-zinc-400">Premium Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={
          mobile
            ? "flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
            : "space-y-1.5 flex-1 overflow-y-auto pr-1 scrollbar-hide"
        }
      >
        {links.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                mobile
                  ? `flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200 shrink-0 ${
                      active
                        ? "bg-white text-black shadow-md"
                        : "bg-zinc-900 text-zinc-400 hover:text-white"
                    }`
                  : `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? "bg-white text-black shadow-lg"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`
              }
            >
              <Icon size={mobile ? 17 : 20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {!mobile && (
        <div className="border-t border-zinc-800 pt-4 mt-4 shrink-0">
          <div className="flex items-center gap-3 bg-zinc-900 rounded-2xl p-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shrink-0">
              <CircleUser size={22} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Admin</p>
              <p className="text-xs text-zinc-400">Çevrimiçi</p>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition">
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      )}
    </>
  );
}

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0A] text-white p-5 flex-col shadow-2xl">
        <SidebarContent />
      </aside>

      {/* MOBILE HEADER */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#0A0A0A] text-white border-b border-zinc-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
            <Store size={20} />
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-base tracking-wide">CANTEK</h1>
            <p className="text-[11px] text-zinc-400">Premium Admin</p>
          </div>
        </div>

        {/* MOBILE NAV */}
        <div className="px-4 pb-3 overflow-hidden">
          <SidebarContent mobile />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main
        className="
          min-h-screen
          w-full
          min-w-0
          overflow-x-hidden
          p-4
          sm:p-5
          md:p-6
          lg:ml-72
          lg:p-8
        "
      >
        {children}
      </main>
    </div>
  );
}
