import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";
import { mergeSettings } from "@/lib/theme";

// Admin panel için hem yayınlanmış hem taslak ayarları döner
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const row = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const published = mergeSettings(row ? JSON.parse(row.data) : null);
  const draft = row?.draft ? mergeSettings(JSON.parse(row.draft)) : published;
  return NextResponse.json({ published, draft });
}

// "Önizle": sadece taslağı kaydet, yayına almaz
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  const body = await req.json(); // { settings, publish: boolean }

  const existing = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const publishedData = body.publish ? JSON.stringify(body.settings) : existing?.data || JSON.stringify(body.settings);
  const draftData = body.publish ? null : JSON.stringify(body.settings);

  const settings = await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: { data: publishedData, draft: draftData },
    create: { id: "main", data: JSON.stringify(body.settings), draft: body.publish ? null : JSON.stringify(body.settings) },
  });

  return NextResponse.json({ success: true, published: body.publish });
}
