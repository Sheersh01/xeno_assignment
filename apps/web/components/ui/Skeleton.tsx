import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/[0.04]",
        className
      )}
    />
  );
}

/** A full skeleton row for tables */
export function SkeletonTableRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-[#111]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  );
}

/** Stat card skeleton */
export function SkeletonStatCard() {
  return (
    <div className="p-5 rounded-md border border-[#1a1a1a] bg-[#0A0A0A] space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/** Full-width block skeleton  */
export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-md border border-[#1a1a1a] bg-[#0A0A0A] p-6 space-y-4", className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
