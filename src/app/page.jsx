import { prisma } from "@/lib/prisma";
import SectionRenderer from "@/components/SectionRenderer";
import BrandStory from "@/components/sections/BrandStory";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sections = await prisma.homepageSection.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  const visibleSections = sections.filter((section) => {
    if (section.type !== "banner") return true;

    try {
      const data =
        typeof section.data === "string"
          ? JSON.parse(section.data)
          : section.data || {};

      return !!(
        data.image ||
        data.title ||
        data.description ||
        data.buttonText
      );
    } catch {
      return false;
    }
  });

  return (
    <div>
      {visibleSections.map((section) => (
        <div key={section.id}>
          <SectionRenderer section={section} />
          {section.type === "hero" && <BrandStory />}
        </div>
      ))}
    </div>
  );
}
