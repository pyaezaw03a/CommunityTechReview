"use client";

import { ProductCard } from "@/components/product-card";
import { useReviews } from "@/components/reviews-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { storageKeys } from "@/lib/storage-keys";

export function SavedProducts() {
  const { products } = useReviews();
  const [savedProducts] = useLocalStorage<string[]>(storageKeys.savedProducts, []);
  const saved = products.filter((product) => savedProducts.includes(product.slug));

  if (!saved.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {saved.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
