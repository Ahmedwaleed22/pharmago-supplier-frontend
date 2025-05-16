import React, { useState, KeyboardEvent, FC } from "react";

interface MultiTagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  tagClassName?: string;
  disabled?: boolean;
}

const MultiTagInput: FC<MultiTagInputProps> = ({
  tags,
  setTags,
  placeholder = "Add tags...",
  maxTags,
  className = "",
  tagClassName = "",
  disabled = false,
}) => {
  const [input, setInput] = useState<string>("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      
      if (maxTags && tags.length >= maxTags) {
        return;
      }
      
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
        setInput("");
      }
    } else if (e.key === "Backspace" && input.trim() === "") {
      if (tags.length > 0) {
        setTags(tags.slice(0, -1));
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={`flex flex-wrap gap-2 p-2 border rounded-md ${className}`}>
      {tags.map((tag) => (
        <div
          key={tag}
          className={`flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md ${tagClassName}`}
        >
          <span className="mr-1">{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-blue-800 hover:text-blue-600"
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          )}
        </div>
      ))}
      {(!maxTags || tags.length < maxTags) && !disabled && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="outline-none flex-grow min-w-[120px]"
          aria-label="Add a tag"
        />
      )}
    </div>
  );
};

export default MultiTagInput;