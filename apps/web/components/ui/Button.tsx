import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const variants = {
      default: "bg-[#EDEDED] text-[#000000] hover:bg-[#D4D4D4] border border-transparent font-medium",
      secondary: "bg-[#1A1A1A] text-[#EDEDED] hover:bg-[#2A2A2A] border border-[#333]",
      outline: "border border-[#333] bg-transparent hover:bg-[#111] text-[#EDEDED]",
      ghost: "hover:bg-[#111] text-[#EDEDED]",
      danger: "bg-[#EF4444] text-[#FFFFFF] hover:bg-[#DC2626] border border-[#B91C1C]",
    }

    const sizes = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8 text-sm",
      icon: "h-9 w-9",
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-[#000] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#EDEDED] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
