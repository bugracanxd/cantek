import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Admin sayfalarını (login hariç) ve admin API'lerini koruma altına alır.
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAdminPage || isAdminApi) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "ADMIN") {
      if (isAdminApi) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
