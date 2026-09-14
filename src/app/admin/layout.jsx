"use client";

import { usePathname } from "next/navigation";
import Providers from "@/components/Providers";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <Providers>
      {isLogin ? (
        children
      ) : (
        <div className="flex bg-gray-50 min-h-screen text-black">
          <AdminSidebar />
          <div className="flex-1 p-8 max-w-6xl">{children}</div>
        </div>
      )}
    </Providers>
  );
}
