import { ChevronDownIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface SelectBoxProps {
  label: string;
  id: string;
  options: string[];
  onChange: (value: string) => void;
  selectedOption: string;
}

function SelectBox({ label, id, options, onChange, selectedOption }: SelectBoxProps) {
  const selectBox = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (selectBox.current) {
      selectBox.current.value = selectedOption;
    }
  }, [selectedOption]);

  return (
    <div onClick={() => selectBox.current?.focus()} className="relative bg-white rounded-md shadow-sm">
      <select defaultValue={selectedOption} className="w-full outline-none py-2 px-3 cursor-pointer appearance-none" id={id} ref={selectBox} onChange={(e) => onChange(e.target.value)}>
        <option disabled>
          {label}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}

export default SelectBox;
