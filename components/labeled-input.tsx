import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";
import MultiTagInput from "./multi-tag-input";

interface LabdeledInputClassName {
  container?: string;
  label?: string;
  input?: string;
}

type InputType = "text" | "select" | "textarea" | "tags" | "file";

interface LabeledInputProps {
  label: string;
  id?: string;
  className?: LabdeledInputClassName;
  placeholder?: string;
  type?: InputType;
  value?: any;
  onChange?: (value: any) => void;
  options?: { label: string; value: string }[];
  rows?: number;
  tags?: string[];
  setTags?: (tags: string[]) => void;
}

function LabeledInput({
  className,
  label,
  id,
  placeholder,
  type = "text",
  value,
  onChange,
  options = [],
  rows = 4,
  tags = [],
  setTags,
}: LabeledInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  const renderInput = (): ReactNode => {
    switch (type) {
      case "select":
        return (
          <div className="relative">
            <select
              id={inputId}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(
                "w-full appearance-none rounded-md border-0 bg-white px-4 py-2 focus:border-[#2970ff] focus:outline-none text-[#414651] shadow-sm",
                className?.input
              )}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        );
      case "textarea":
        return (
          <textarea
            id={inputId}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            rows={rows}
            className={cn(
              "w-full rounded-md bg-white border-0 px-4 py-2 focus:border-[#2970ff] focus:outline-none text-[#414651] placeholder:text-[#acb5c9] shadow-sm",
              className?.input
            )}
          />
        );
      case "tags":
        return (
          <MultiTagInput
            className={cn(
              "w-full rounded-md bg-white border-0 px-4 py-2 focus:border-[#2970ff] focus:outline-none text-[#414651] placeholder:text-[#acb5c9] shadow-sm",
              className?.input
            )}
            tags={tags || []}
            setTags={setTags || (() => {})}
            placeholder={placeholder}
          />
        );
      case "file":
        return (
          <input
            id={inputId}
            type="file"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              "w-full rounded-md bg-white border-0 px-4 py-2 focus:border-[#2970ff] focus:outline-none text-[#414651] placeholder:text-[#acb5c9] shadow-sm",
              className?.input
            )}
          />
        );
      default:
        return (
          <input
            id={inputId}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              "w-full rounded-md bg-white border-0 px-4 py-2 focus:border-[#2970ff] focus:outline-none text-[#414651] placeholder:text-[#acb5c9] shadow-sm",
              className?.input
            )}
          />
        );
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className?.container)}>
      <label
        htmlFor={inputId}
        className={cn("mb-2 block text-[#414651] font-medium", className?.label)}
      >
        {label}
      </label>
      {renderInput()}
    </div>
  );
}

export default LabeledInput;
