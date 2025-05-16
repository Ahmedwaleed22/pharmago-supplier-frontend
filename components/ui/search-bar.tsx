"use client";

import { Search, X } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  logoClassName?: string;
  value: string;
  setValue: (value: string) => void;
}

function SearchBar({
  className,
  placeholder = "Search...",
  logoClassName,
  value,
  setValue,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "bg-white w-full max-w-[264px] h-[40px] rounded-md lg:flex items-center gap-2 px-3 hidden shadow-sm relative",
        className
      )}
    >
      <Search className={cn("w-5 h-5", logoClassName)} />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full h-full outline-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && value.length > 0 && (
        <div className="absolute right-3 border-2 border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 transition-all duration-300 rounded-full cursor-pointer">
          <X className="w-4 h-4 font-light" />
        </div>
      )}
    </div>
  );
}

export default SearchBar;
