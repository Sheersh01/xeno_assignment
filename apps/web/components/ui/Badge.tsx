import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#1E2329] text-[#F8F9FA] border-transparent",
    success: "bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30",
    warning: "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30",
    danger: "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30",
    outline: "text-[#F8F9FA] border-[#1E2329]",
  };

  return (
    <div className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)} {...props} />
  )
}

export { Badge }
