"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const routes = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Library", icon: Library, href: "/library" },
    { label: "Upload", icon: PlusCircle, href: "/upload" },
    // { label: "Profile", icon: User, href: "/profile" }, // Add later if needed
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 z-40 flex items-center justify-between h-16 pb-safe">
      {routes.map((route) => {
        const isActive = pathname === route.href;
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[64px]",
              isActive ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <route.icon
                size={24}
                fill={isActive ? "currentColor" : "none"}
                className={isActive ? "scale-110 transition-transform" : ""}
            />
            <span className="text-[10px] font-medium">{route.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
