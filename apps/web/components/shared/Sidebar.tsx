"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, PieChart, Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Segments (AI)", href: "/segments", icon: Sparkles },
  { name: "Campaigns", href: "/campaigns/new", icon: Send },
  { name: "Analytics", href: "/analytics", icon: PieChart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-[#222] bg-[#000] flex flex-col h-full z-10 relative text-sm">
      <div className="h-14 flex items-center px-5 border-b border-[#222]">
        <div className="flex items-center gap-2 cursor-default">
          <div className="w-5 h-5 bg-[#EDEDED] flex items-center justify-center rounded-[4px]">
            <span className="text-[#000] font-bold text-[10px]">X</span>
          </div>
          <span className="font-semibold text-[#EDEDED] tracking-tight">Xeno CRM</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="px-2 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#555]">Menu</span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                isActive 
                  ? "bg-[#1A1A1A] text-[#EDEDED]" 
                  : "text-[#A0A0A0] hover:text-[#EDEDED] hover:bg-[#111]"
              )}
            >
              <item.icon className={cn("w-3.5 h-3.5 transition-colors", isActive ? "text-[#EDEDED]" : "text-[#777] group-hover:text-[#A0A0A0]")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#222]">
        <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-[#111] transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded bg-[#222] flex items-center justify-center text-[10px] font-medium text-[#EDEDED]">
            US
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-[#EDEDED] leading-none">Marketing Admin</span>
            <span className="text-[10px] text-[#777] mt-1">Xeno Engineering</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
