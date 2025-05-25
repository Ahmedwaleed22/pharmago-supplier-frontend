import { ChevronDownIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { cn } from "@/lib/utils";

interface SelectBoxProps {
  label: string;
  id: string;
  options: string[];
  onChange: (value: string) => void;
  selectedOption: string;
}

function SelectBox({ label, id, options, onChange, selectedOption }: SelectBoxProps) {
  const { isRtl } = useI18n();
  const selectBox = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (selectBox.current) {
      selectBox.current.value = selectedOption;
    }
  }, [selectedOption]);

  return (
    <div onClick={() => selectBox.current?.focus()} className="relative bg-white rounded-md shadow-sm">
      <select 
        defaultValue={selectedOption} 
        className={cn(
          "w-full outline-none py-2 cursor-pointer appearance-none",
          isRtl ? "text-left pr-10 pl-3" : "text-left pl-3 pr-10",
        )}
        id={id} 
        ref={selectBox} 
        onChange={(e) => onChange(e.target.value)}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <option disabled>
          {label}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div className={cn(
        "absolute top-1/2 -translate-y-1/2 pointer-events-none",
        isRtl ? "left-3" : "right-3"
      )}>
        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}

export default SelectBox;
