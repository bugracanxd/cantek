import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return {};
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description.slice(0, 150),
  };
}

export default async function ProductPage({ params }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: { orderBy: { order: "asc" } }, category: true },
  });

  if (!product || !product.isActive) notFound();

  return <ProductDetail product={product} />;
}
