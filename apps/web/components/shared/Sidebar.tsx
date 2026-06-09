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
    <aside className="w-64 border-r border-[#1E2329] bg-[#0B0D0F] flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-[#1E2329]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#8B5CF6] flex items-center justify-center">
            <span className="text-white font-bold text-lg">X</span>
          </div>
          <span className="font-semibold text-[#F8F9FA] tracking-tight">Xeno CRM</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-[#1E2329] text-[#F8F9FA]" 
                  : "text-[#A1A8B3] hover:text-[#F8F9FA] hover:bg-[#111417]"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-[#8B5CF6]" : "text-[#A1A8B3]")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1E2329]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1E2329] flex items-center justify-center text-xs font-medium text-[#F8F9FA]">
            US
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#F8F9FA]">Marketing Admin</span>
            <span className="text-xs text-[#A1A8B3]">Xeno Engineering</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
