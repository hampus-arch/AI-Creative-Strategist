"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSelectedBrand } from "@/lib/brand-context";
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  Settings,
  Library,
  ChevronDown,
  Search,
  Check,
  Plus,
} from "lucide-react";

const navigation = [
  { name: "Framework", href: "/", icon: LayoutDashboard },
  { name: "Brands", href: "/brands", icon: Building2 },
  { name: "Ad Library", href: "/ads", icon: Library },
  { name: "Generate", href: "/generate", icon: Sparkles },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Generate a consistent color based on brand name
function getBrandColor(name: string): string {
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-rose-500 to-pink-600",
    "from-indigo-500 to-blue-600",
    "from-fuchsia-500 to-purple-600",
    "from-lime-500 to-green-600",
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Sidebar() {
  const pathname = usePathname();
  const { brands, selectedBrand, setSelectedBrandId, isLoading } = useSelectedBrand();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-64 bg-neutral-900 border-r border-neutral-800">
      {/* Brand Selector - Motion App Style */}
      <div className="p-3 border-b border-neutral-800">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between h-auto py-2 px-3 hover:bg-neutral-800"
            >
              <div className="flex items-center gap-3">
                {selectedBrand ? (
                  <>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                        getBrandColor(selectedBrand.name)
                      )}
                    >
                      <span className="text-white font-bold text-sm">
                        {selectedBrand.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-white truncate max-w-[120px]">
                      {selectedBrand.name}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-neutral-400" />
                    </div>
                    <span className="text-neutral-400">
                      {isLoading ? "Loading..." : "Select Brand"}
                    </span>
                  </>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-0 bg-neutral-900 border-neutral-700"
            align="start"
          >
            {/* Search */}
            <div className="p-2 border-b border-neutral-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 bg-neutral-800 border-neutral-700 text-white text-sm"
                />
              </div>
            </div>

            {/* Brand List */}
            <ScrollArea className="max-h-64">
              <div className="p-1">
                {/* All Brands option */}
                <button
                  onClick={() => {
                    setSelectedBrandId(null);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    !selectedBrand
                      ? "bg-orange-500/20 text-orange-500"
                      : "text-neutral-300 hover:bg-neutral-800"
                  )}
                >
                  <div className="w-7 h-7 rounded-md bg-neutral-700 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                  <span className="text-sm font-medium flex-1 text-left">All Brands</span>
                  {!selectedBrand && <Check className="w-4 h-4" />}
                </button>

                {/* Brand items */}
                {filteredBrands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => {
                      setSelectedBrandId(brand.id);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      selectedBrand?.id === brand.id
                        ? "bg-orange-500/20 text-orange-500"
                        : "text-neutral-300 hover:bg-neutral-800"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-md bg-gradient-to-br flex items-center justify-center",
                        getBrandColor(brand.name)
                      )}
                    >
                      <span className="text-white font-bold text-xs">
                        {brand.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium flex-1 text-left truncate">
                      {brand.name}
                    </span>
                    {selectedBrand?.id === brand.id && <Check className="w-4 h-4" />}
                  </button>
                ))}

                {filteredBrands.length === 0 && searchQuery && (
                  <p className="text-sm text-neutral-500 text-center py-4">
                    No brands found
                  </p>
                )}
              </div>
            </ScrollArea>

            {/* Add Brand Link */}
            <div className="p-2 border-t border-neutral-800">
              <Link href="/brands" onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Brand
                </Button>
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>

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
