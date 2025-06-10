"use client";

import { Search } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/i18n-context";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/dashboard/delivery/history?search=${value}`);
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
      {((value && value.length > 0) || (search && search.length > 0)) && (
        <form className={`absolute ${isRtl ? "left-2" : "right-2"}`} onSubmit={handleSearch}>
          <button 
            type="submit"
            className={cn(
              "text-2xl p-1 bg-[#fdfdfd] shadow-sm text-primary-blue hover:border-primary-blue-hover hover:text-primary-blue-hover transition-all duration-300 rounded-sm cursor-pointer",
              isRtl ? "left-3" : "right-3"
            )}
          >
            <Search className="w-4 h-4 font-light" />
          </button>
        </form>
      )}
    </div>
  );
}

export default SearchBar;
