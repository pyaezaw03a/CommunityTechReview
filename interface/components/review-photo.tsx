"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ReviewPhotoProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
};

export function ReviewPhoto({ src, alt, sizes, className }: ReviewPhotoProps) {
  const [aspectRatio, setAspectRatio] = useState("4 / 3");

  useEffect(() => {
    setAspectRatio("4 / 3");
  }, [src]);

  return (
    <div
      className={cn("relative max-h-[34rem] w-full overflow-hidden border border-ink bg-paper", className)}
      style={{ aspectRatio }}
    >
      <div className="absolute inset-2 sm:inset-3">
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes={sizes}
          className="object-contain"
          style={{ objectFit: "contain" }}
          onLoad={(event) => {
            const image = event.currentTarget;
            if (image.naturalWidth && image.naturalHeight) {
              setAspectRatio(`${image.naturalWidth} / ${image.naturalHeight}`);
            }
          }}
        />
      </div>
    </div>
  );
}
