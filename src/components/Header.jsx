"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header({ settings, menus }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pulseCart, setPulseCart] = useState(false);
  const { itemCount } = useCart();
  const { data: session } = useSession();
  const header = settings.header;
  const general = settings.general;
  const prevCount = useRef(itemCount);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setPulseCart(true);
      const t = setTimeout(() => setPulseCart(false), 400);
      return () => clearTimeout(t);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  return (
  <header
    style={{ color: header.textColor }}
    className="sticky top-0 z-40 border-b border-black/10 bg-[#F8F7F4]/95 backdrop-blur-xl"
  >
    <div className="h-9 bg-[#111111] text-white text-[11px] uppercase tracking-[0.22em] flex items-center justify-center">
      Hakiki Deri • Ücretsiz Kargo • Güvenli Ödeme
    </div>

    <div className="site-container flex h-[84px] items-center justify-between gap-4">
        <Link
  href="/"
  className="flex items-center gap-3 shrink-0 font-heading text-2xl font-bold tracking-[0.22em]"
>
          {general.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={general.logo} alt={general.siteName} className="h-10 w-auto" />
          ) : null}
          <span>{general.siteName}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-9 text-[13px] font-medium uppercase tracking-[0.14em]">
          {menus.map((m) => (
            <Link key={m.id} href={m.url} className="nav-link hover:opacity-80 transition-opacity">
              {m.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          {header.showSearch && (
            <button
              aria-label="Ara"
              onClick={() => setSearchOpen((v) => !v)}
              className="hover:opacity-70 transition-transform active:scale-90"
            >
              <Search size={18} strokeWidth={1.75} />
            </button>
          )}

          {header.showAccount &&
            (session ? (
              <div
                className="relative"
                onMouseEnter={() => setAccountOpen(true)}
                onMouseLeave={() => setAccountOpen(false)}
              >
                <button className="flex items-center gap-1 hover:opacity-70 transition-transform active:scale-90">
                  <User size={18} strokeWidth={1.75} />
                  <ChevronDown size={13} className={`transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full bg-white shadow-xl rounded-site py-2 w-48 text-black border"
                    >
                      <Link href="/account" className="block px-4 py-2.5 text-sm hover:bg-gray-50">Hesabım</Link>
                      <Link href="/account/orders" className="block px-4 py-2.5 text-sm hover:bg-gray-50">Siparişlerim</Link>
                      <button onClick={() => signOut()} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50">
                        Çıkış Yap
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" aria-label="Hesabım" className="hover:opacity-70 transition-transform active:scale-90">
                <User size={19} strokeWidth={1.75} />
              </Link>
            ))}

          {header.showCart && (
            <Link href="/cart" aria-label="Sepetim" className="relative hover:opacity-70 transition-transform active:scale-90">
              <ShoppingBag size={18} strokeWidth={1.75} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: pulseCart ? [1, 1.4, 1] : 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute -top-2 -right-2 bg-[var(--color-secondary)] text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}

          <button
            className="md:hidden hover:opacity-70 transition-transform active:scale-90"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menü"
          >
            {mobileOpen ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            action="/search"
            className="overflow-hidden border-t bg-white"
          >
            <div className="site-container py-4 flex items-center gap-3">
              <Search size={18} className="text-gray-400" />
              <input
  name="q"
  autoFocus
  placeholder="Hakiki deri, casual, klasik..."
  className="flex-1 bg-transparent py-2 text-sm text-black outline-none placeholder:text-neutral-400"
/>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white border-t overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1 text-black">
              {menus.map((m) => (
                <Link
                  key={m.id}
                  href={m.url}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 border-b border-gray-100 text-sm font-medium"
                >
                  {m.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
