import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, requireAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Basit yerel dosya yükleme (public/uploads). Production'da bunun yerine
// S3 / Cloudinary / Vercel Blob gibi kalıcı bir depolama servisi ÖNERİLİR,
// çünkü çoğu hosting sağlayıcısının dosya sistemi geçicidir (ephemeral).
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Sadece görsel dosyaları yüklenebilir" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Dosya 5MB'dan büyük olamaz" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const blob = await put(filename, file, {
  access: "public",
});

return NextResponse.json({
  url: blob.url,
});

  return NextResponse.json({ url: `/uploads/${filename}` });
}
