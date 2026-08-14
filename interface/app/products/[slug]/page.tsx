import type { Metadata } from "next";

import { ProductDetail } from "@/components/product-detail";

export const metadata: Metadata = {
  title: "Reviewed Product",
  description: "Product feedback created from real GadgetPulse user reviews."
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
