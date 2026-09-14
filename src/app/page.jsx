import { prisma } from "@/lib/prisma";
import SectionRenderer from "@/components/SectionRenderer";
import BrandStory from "@/components/sections/BrandStory";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sections = await prisma.homepageSection.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      {sections.map((section) => (
  <>
    <SectionRenderer key={section.id} section={section} />
    {section.type === "hero" && <BrandStory />}
  </>
))}
    </div>
  );
}
