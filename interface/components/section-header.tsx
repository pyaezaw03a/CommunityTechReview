import { cn } from "@/lib/utils";

export function SectionHeader({
  kicker,
  title,
  copy,
  className
}: {
  kicker?: string;
  title: string;
  copy?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {kicker ? <p className="mb-3 text-xs font-black uppercase text-signal">{kicker}</p> : null}
      <h2 className="text-balance text-4xl font-black uppercase leading-[0.95] text-ink sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {copy ? <p className="mt-4 text-base leading-7 text-muted sm:text-lg">{copy}</p> : null}
    </div>
  );
}
