import { cn } from "@/lib/utils";
import type { Product } from "@/data/domain";
import { ReviewPhoto } from "@/components/review-photo";

type ProductVisualProps = {
  category?: string;
  accent?: "signal" | "olive" | "peach" | "ink";
  className?: string;
  photoUrl?: string;
  productName?: string;
};

const accentClasses = {
  signal: "bg-signal",
  olive: "bg-olive",
  peach: "bg-peach",
  ink: "bg-ink"
};

export function ProductGlyph({
  category = "Smartphones",
  accent = "signal",
  className,
  photoUrl,
  productName = "Reviewed product"
}: ProductVisualProps) {
  const accentClass = accentClasses[accent];
  const shell = cn("relative h-28 w-full overflow-hidden border border-ink bg-paper technical-grid", className);

  if (photoUrl) {
    return (
      <ReviewPhoto
        src={photoUrl}
        alt={productName}
        sizes="(max-width: 768px) 100vw, 50vw"
        className={cn("bg-white technical-grid", className)}
      />
    );
  }

  if (category === "Laptops") {
    return (
      <div className={shell}>
        <div className="absolute left-1/2 top-1/4 h-1/2 w-1/2 -translate-x-1/2 border-2 border-ink bg-white">
          <div className={cn("absolute left-4 top-4 h-3 w-20", accentClass)} />
        </div>
        <div className="absolute bottom-[18%] left-1/2 h-4 w-3/5 -translate-x-1/2 border border-ink bg-white" />
      </div>
    );
  }

  if (category === "Audio") {
    return (
      <div className={shell}>
        <div className="absolute left-[28%] top-[33%] h-16 w-10 rounded-full border-2 border-ink bg-white" />
        <div className="absolute right-[28%] top-[33%] h-16 w-10 rounded-full border-2 border-ink bg-white" />
        <div className="absolute left-1/2 top-[18%] h-16 w-40 -translate-x-1/2 rounded-t-full border-2 border-b-0 border-ink" />
        <div className={cn("absolute bottom-[18%] left-1/2 h-2 w-32 -translate-x-1/2", accentClass)} />
      </div>
    );
  }

  if (category === "Wearables") {
    return (
      <div className={shell}>
        <div className="absolute left-1/2 top-[18%] h-3/5 w-20 -translate-x-1/2 border-2 border-ink bg-white">
          <div className={cn("absolute left-1/2 top-5 h-10 w-10 -translate-x-1/2 rounded-full border border-ink", accentClass)} />
        </div>
        <div className="absolute left-1/2 top-0 h-8 w-12 -translate-x-1/2 border border-ink bg-white" />
        <div className="absolute bottom-0 left-1/2 h-8 w-12 -translate-x-1/2 border border-ink bg-white" />
      </div>
    );
  }

  if (category === "Gaming") {
    return (
      <div className={shell}>
        <div className="absolute left-1/2 top-1/2 h-16 w-52 -translate-x-1/2 -translate-y-1/2 border-2 border-ink bg-white">
          <div className="absolute left-8 top-5 h-7 w-7 rounded-full border border-ink" />
          <div className={cn("absolute right-8 top-5 h-7 w-7 rounded-full border border-ink", accentClass)} />
        </div>
      </div>
    );
  }

  if (category === "Accessories") {
    return (
      <div className={shell}>
        <div className="absolute left-1/2 top-1/2 h-24 w-36 -translate-x-1/2 -translate-y-1/2 border-2 border-ink bg-white">
          <div className={cn("absolute left-5 top-5 h-7 w-20", accentClass)} />
          <div className="absolute bottom-5 left-5 right-5 h-px bg-ink" />
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="absolute left-1/2 top-1/2 h-4/5 w-24 -translate-x-1/2 -translate-y-1/2 border-2 border-ink bg-white">
        <div className={cn("absolute left-1/2 top-8 h-14 w-14 -translate-x-1/2", accentClass)} />
        <div className="absolute bottom-6 left-5 right-5 h-px bg-ink" />
      </div>
      <div className="absolute left-10 top-14 h-px w-20 bg-ink" />
      <div className="absolute right-10 bottom-16 h-px w-20 bg-ink" />
    </div>
  );
}

export function HeroDeviceComposition({
  product,
  rating,
  reviewCount
}: {
  product: Product;
  rating: number;
  reviewCount: number;
}) {
  const labels = ["Battery Performance", "Camera Quality", "Real User Score", "Heat Management", "Everyday Experience"];

  return (
    <div className="relative min-h-[430px] overflow-hidden border border-ink bg-white p-4 technical-grid md:min-h-[560px]">
      <div className="absolute inset-6 border border-ink/25" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 h-[320px] w-[164px] -translate-x-1/2 -translate-y-1/2 rotate-[-7deg] border-[3px] border-ink bg-paper shadow-hard-md md:h-[390px] md:w-[198px]">
        <div className="absolute inset-5 border border-ink bg-white">
          <div className="absolute inset-x-4 top-5 h-20 border border-ink bg-peach" />
          <div className="absolute left-4 top-32 h-8 w-20 bg-signal" />
          <div className="absolute bottom-5 left-4 right-4 h-2 bg-olive" />
        </div>
      </div>
      <div className="absolute bottom-12 left-7 h-28 w-48 rotate-[4deg] border-2 border-ink bg-paper shadow-hard-sm md:left-12 md:h-36 md:w-60">
        <div className="absolute left-4 top-4 h-3 w-24 bg-ink" />
        <div className="absolute right-5 top-8 h-12 w-16 border border-ink bg-white" />
      </div>
      <div className="absolute right-8 top-28 h-24 w-24 rounded-full border-2 border-ink bg-paper md:right-14">
        <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink bg-white" />
        <div className="absolute left-1/2 top-1/2 h-1 w-10 origin-left -rotate-45 bg-signal" />
      </div>
      {labels.map((label, index) => (
        <div
          key={label}
          className={cn(
            "absolute hidden border border-ink bg-paper px-2 py-1 text-[10px] font-black uppercase text-ink md:block",
            index % 2 ? "right-8" : "left-8",
            index < 2 ? "top-12" : index < 4 ? "bottom-28" : "top-4 left-1/3"
          )}
        >
          <span className="text-signal">0{index + 1}</span> {label}
        </div>
      ))}
      <div className="absolute right-5 top-5 border border-ink bg-white p-3 shadow-hard-sm md:right-10 md:top-10">
        <p className="text-xs font-black uppercase text-ink">{product.name}</p>
        <p className="mt-2 text-xs uppercase text-muted">Community Score</p>
        <p className="text-3xl font-black text-signal">{rating.toFixed(1)} / 5</p>
        <p className="text-xs font-semibold uppercase text-muted">
          {reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
        </p>
      </div>
      <div className="absolute left-0 top-1/4 h-12 w-full animate-scan bg-signal/10" aria-hidden="true" />
    </div>
  );
}
