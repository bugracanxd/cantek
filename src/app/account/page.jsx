"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status !== "authenticated") return null;

  return (
    <div className="site-container py-10 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Hesabım</h1>
      <div className="border rounded-site p-6 space-y-2 mb-6">
        <div><strong>Ad Soyad:</strong> {session.user.name}</div>
        <div><strong>E-posta:</strong> {session.user.email}</div>
      </div>
      <Link href="/account/orders" className="btn-primary inline-block px-6 py-3">
        Siparişlerim
      </Link>
    </div>
  );
}
