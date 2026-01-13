"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"; // We will simulate a simple sheet below without extra libs

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Brand */}
      <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
        Rythmiq.
      </h1>

      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Sidebar Overlay */}
      {/* Using simple conditional rendering for the 'drawer' effect */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar Content */}
          <div className="relative bg-white w-64 h-full shadow-xl animate-in slide-in-from-left duration-300">
             {/* Reuse existing Sidebar logic here, but wrapped for mobile */}
             <div className="h-full overflow-y-auto">
                <Sidebar mobile onClose={() => setIsOpen(false)} />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
