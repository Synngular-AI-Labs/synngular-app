import React from "react";
import { ArrowLeft } from "lucide-react";

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
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  setIsSearchActive,
  placeholder = "Search",
  onFilterClick,
}) => {
  return (
    <div className="w-full max-w-[355px] h-[36px] flex flex-row items-center justify-between gap-2 mx-auto">
      <button
        type="button"
        onClick={() => {
          setSearchQuery("");
          setIsSearchActive(false);
        }}
        className="w-[36px] h-[36px] flex items-center justify-center cursor-pointer text-[var(--foreground)]"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="flex-1 h-[36px] bg-[var(--grey-100)] rounded-full px-4 flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--grey-500)]"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          if (onFilterClick) {
            onFilterClick();
          } else {
            console.log("Filter clicked");
          }
        }}
        className="w-[36px] h-[36px] flex items-center justify-center cursor-pointer text-[var(--foreground)]"
      >
        <FilterIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SearchBar;
