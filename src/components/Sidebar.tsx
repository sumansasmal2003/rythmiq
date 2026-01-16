"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, PlusCircle, Settings, Music2, Search, Mic2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const routes = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Search", icon: Search, href: "/search" },
    { label: "Artists", icon: Mic2, href: "/artists" },
    { label: "Library", icon: Library, href: "/library" },
    { label: "Upload Track", icon: PlusCircle, href: "/upload" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="h-full bg-white border-r border-gray-100 flex flex-col w-64">

      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
          <Music2 size={24} />
        </div>
        <span className="text-2xl font-bold text-gray-900 tracking-tight">Rythmiq</span>
      </div>

      {/* Nav Links */}
      <div className="flex-1 px-4 py-4 space-y-2">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">Menu</div>
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200",
                isActive
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <route.icon size={20} className={isActive ? "text-indigo-600" : "text-gray-400"} />
              {route.label}
            </Link>
          );
        })}
      </div>

      {/* Account Section Removed as requested */}
    </div>
  );
}
