import { prisma } from "@/lib/prisma";
import { mergeSettings } from "@/lib/theme";

// Server component'lerde kullanılacak, yayınlanmış (draft değil) ayarları döner.
export async function getSiteSettings() {
  const row = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const parsed = row ? JSON.parse(row.data) : null;
  return mergeSettings(parsed);
}

export async function getMenus(location = "header") {
  return prisma.menu.findMany({
    where: { location, isActive: true },
    orderBy: { order: "asc" },
  });
}
