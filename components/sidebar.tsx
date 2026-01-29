"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  Settings,
  Library,
} from "lucide-react";

const navigation = [
  { name: "Framework", href: "/", icon: LayoutDashboard },
  { name: "Brands", href: "/brands", icon: Building2 },
  { name: "Ad Library", href: "/ads", icon: Library },
  { name: "Generate", href: "/generate", icon: Sparkles },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-neutral-900 border-r border-neutral-800">
      {/* Logo */}
      <div className="p-4 border-b border-neutral-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-white font-bold">OJ</span>
          </div>
          <div>
            <h1 className="font-bold text-white">Creative</h1>
            <p className="text-xs text-orange-500">Strategist</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-orange-500/10 text-orange-500"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User display */}
      <div className="p-4 border-t border-neutral-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-default"
          disabled
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-orange-500/20 text-orange-500 text-sm">
              D
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-white truncate">
              Demo Mode
            </p>
          </div>
        </Button>
      </div>
    </div>
  );
}
