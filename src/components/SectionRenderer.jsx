import Hero from "@/components/sections/Hero";
import BannerSection from "@/components/sections/Banner";
import ProductGridSection from "@/components/sections/ProductGrid";
import CategoryGridSection from "@/components/sections/CategoryGrid";
import BrandStorySection from "@/components/sections/BrandStory";
import InstagramSection from "@/components/sections/Instagram";
import NewsletterSection from "@/components/sections/Newsletter";
import FeaturesSection from "@/components/sections/Features";
import FAQSection from "@/components/sections/FAQ";
import VideoSection from "@/components/sections/VideoSection";
import TextSection from "@/components/sections/TextSection";
import LogoStripSection from "@/components/sections/LogoStrip";

const REGISTRY = {
  hero: Hero,
  banner: BannerSection,
  product_grid: ProductGridSection,
  category_grid: CategoryGridSection,
  brand_story: BrandStorySection,
  instagram: InstagramSection,
  newsletter: NewsletterSection,
  features: FeaturesSection,
  faq: FAQSection,
  video: VideoSection,
  text: TextSection,
  logo_strip: LogoStripSection,
};

export default function SectionRenderer({ section }) {
  const Component = REGISTRY[section.type];
  if (!Component) return null;
  const data = JSON.parse(section.data || "{}");
  return <Component data={data} />;
}

export const SECTION_TYPES = Object.keys(REGISTRY);
