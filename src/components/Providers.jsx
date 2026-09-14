"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster position="top-center" />
      </CartProvider>
    </SessionProvider>
  );
}
