import React from "react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

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
        <SlidersHorizontal className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SearchBar;
