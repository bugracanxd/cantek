import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, requireAdmin } from "@/lib/auth";
import { put } from "@vercel/blob";
import path from "path";
import crypto from "crypto";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!requireAdmin(session)) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Sadece görsel dosyaları yüklenebilir" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya 5MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || "";
    const filename = `${crypto.randomUUID()}${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url });

  } catch (err) {
    console.error("UPLOAD HATASI:", err);

    return NextResponse.json(
      {
        error: err?.message || "Upload başarısız",
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      },
      { status: 500 }
    );
  }
}