import { prisma } from "@/lib/prisma";
import { mergeSettings } from "@/lib/theme";
import { unstable_noStore as noStore } from "next/cache";

export async function getSiteSettings() {
  noStore();

  const row = await prisma.siteSettings.findUnique({
    where: { id: "main" },
  });

  const parsed = row ? JSON.parse(row.data) : null;
  return mergeSettings(parsed);
}

export async function getMenus(location = "header") {
  noStore();

  return prisma.menu.findMany({
    where: {
      location,
      isActive: true,
    },
    orderBy: {
      order: "asc",
    },
  });
}