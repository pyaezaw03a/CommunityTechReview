"use client";

import { useMemo, useState } from "react";

import { CompareMatrix } from "@/components/compare-matrix";
import { useReviews } from "@/components/reviews-provider";
import { Select } from "@/components/ui/select";

export function CompareLab() {
  const { products } = useReviews();
  const [leftSlug, setLeftSlug] = useState("");
  const [rightSlug, setRightSlug] = useState("");
  const left = useMemo(() => products.find((product) => product.slug === leftSlug) ?? products[0], [leftSlug, products]);
  const right = useMemo(
    () => products.find((product) => product.slug === rightSlug) ?? products.find((product) => product.slug !== left?.slug),
    [left?.slug, products, rightSlug]
  );

  if (!left || !right) return null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 border border-ink bg-white p-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-black uppercase text-ink">
          Product A
          <Select value={left.slug} onChange={(event) => setLeftSlug(event.target.value)}>
            {products.map((product) => (
              <option key={product.slug} value={product.slug} disabled={product.slug === rightSlug}>
                {product.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-2 text-sm font-black uppercase text-ink">
          Product B
          <Select value={right.slug} onChange={(event) => setRightSlug(event.target.value)}>
            {products.map((product) => (
              <option key={product.slug} value={product.slug} disabled={product.slug === leftSlug}>
                {product.name}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <CompareMatrix left={left} right={right} cta={false} />
    </div>
  );
}
