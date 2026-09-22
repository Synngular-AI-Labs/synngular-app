import React, { useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";

// Custom filter icon (settings-2 style)
const FilterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 17H5" />
    <path d="M19 7h-9" />
    <circle cx="17" cy="17" r="3" />
    <circle cx="7" cy="7" r="3" />
  </svg>
);

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  setIsSearchActive: (value: boolean) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  isFilterActive?: boolean;
  showBackButton?: boolean;
  showFilterButton?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  setIsSearchActive,
  placeholder = "Search",
  onFilterClick,
  isFilterActive = false,
  showBackButton = true,
  showFilterButton = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full h-[var(--btn-size-36)] flex flex-row items-center gap-2">
      {showBackButton && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setIsSearchActive(false);
          }}
          className="w-[var(--btn-size-36)] h-[var(--btn-size-36)] flex items-center justify-center shrink-0 cursor-pointer text-[var(--foreground)]"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <div
        className={`h-[var(--btn-size-36)] bg-[var(--grey-100)] border rounded-lg px-[var(--spacing-16)] flex items-center gap-2 transition-colors ${
          isFocused ? "border-[var(--purple-1000)] shadow-[0_0_0_1px_var(--purple-1000)]" : "border-[var(--grey-300)]"
        } ${showBackButton || showFilterButton ? "flex-1" : "w-full"}`}
      >
        <Search className="h-4 w-4 shrink-0 text-[var(--grey-500)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--grey-500)]"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearchQuery("")}
            className="flex h-5 w-5 shrink-0 items-center justify-center text-[var(--grey-600)]"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {showFilterButton && (
        <button
          type="button"
          aria-label="Filter"
          onClick={() => {
            if (onFilterClick) {
              onFilterClick();
            } else {
              console.log("Filter clicked");
            }
          }}
          className={`w-[var(--btn-size-36)] h-[var(--btn-size-36)] flex items-center justify-center shrink-0 cursor-pointer rounded-full text-[var(--foreground)] transition-colors ${
            isFilterActive ? "bg-[var(--grey-200)]" : ""
          }`}
        >
          <FilterIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
