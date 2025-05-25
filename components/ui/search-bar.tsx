"use client";

import { Search, X } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/i18n-context";

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
  const { isRtl } = useI18n();
  
  const handleClear = () => {
    setValue("");
  };

  return (
    <div
      className={cn(
        "bg-white w-full max-w-[264px] h-[40px] rounded-md lg:flex items-center gap-2 px-3 hidden shadow-sm relative",
        className
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Search className={cn("w-5 h-5", logoClassName)} />
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "w-full h-full outline-none text-left",
        )}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        dir={isRtl ? "rtl" : "ltr"}
      />
      {value && value.length > 0 && (
        <div 
          onClick={handleClear}
          className={cn(
            "absolute border-2 border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 transition-all duration-300 rounded-full cursor-pointer",
            isRtl ? "left-3" : "right-3"
          )}
        >
          <X className="w-4 h-4 font-light" />
        </div>
      )}
    </div>
  );
}

export default SearchBar;
