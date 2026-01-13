import { GlobalSearch } from "./GlobalSearch";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 md:px-6 md:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <div className="w-full max-w-2xl">
           <GlobalSearch />
        </div>
      </div>
    </header>
  );
}
