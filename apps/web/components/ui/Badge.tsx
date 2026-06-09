import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#222] text-[#EDEDED] border-transparent",
    success: "bg-[#052E16] text-[#34D399] border-[#065F46]",
    warning: "bg-[#451A03] text-[#FBBF24] border-[#78350F]",
    danger: "bg-[#450A0A] text-[#F87171] border-[#7F1D1D]",
    outline: "text-[#A0A0A0] border-[#333]",
  };

  return (
    <div className={cn("inline-flex items-center rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold transition-colors", variants[variant], className)} {...props} />
  )
}

export { Badge }
