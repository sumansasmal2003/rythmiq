"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Settings, Library, X } from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
  { label: "Discover", icon: Home, href: "/" },
  { label: "Library", icon: Library, href: "/library" },
  { label: "Upload Music", icon: PlusCircle, href: "/upload" },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200",
      mobile ? "w-full border-none" : "w-64" // Full width inside mobile drawer
    )}>
      {/* Logo Area (Only show on desktop sidebar, mobile header handles it) */}
      {!mobile && (
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Rythmiq.
          </h1>
        </div>
      )}

      {/* Close Button for Mobile */}
      {mobile && (
        <div className="flex justify-end p-4">
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X size={20} />
            </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 flex flex-col w-full px-3 gap-1 mt-4 md:mt-0">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={onClose} // Close sidebar on click (mobile only)
            className={cn(
              "flex items-center gap-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
              pathname === route.href
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <route.icon size={20} />
            {route.label}
          </Link>
        ))}
      </div>

      {/* Settings Footer */}
      <div className="p-4 border-t border-gray-100 mt-auto">
        <button className="flex items-center gap-x-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 w-full rounded-lg hover:bg-gray-50 transition-colors">
          <Settings size={20} />
          Settings
        </button>
      </div>
    </div>
  );
}
