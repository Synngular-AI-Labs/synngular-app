import React from "react";
import { Search, Bell } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────── */

export interface ScreenHeaderProps {
  title: string;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
}

/* ── Component ──────────────────────────────────────────────────────── */

// Single title-row header for every list screen (Agents, Outputs, Approvals, …).
// The screen still owns the <header> wrapper (padding/safe-area/search-swap);
// this only renders the title + search/bell row so it stays identical everywhere.
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onSearchClick,
  onNotificationsClick,
}) => (
  <div className="flex flex-row justify-between items-center">
    <h1 className="text-card-title-20" style={{ color: "var(--foreground)" }}>
      {title}
    </h1>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onSearchClick}
        className="p-2 cursor-pointer rounded-full active:bg-[var(--grey-100)] transition-colors"
        style={{ color: "var(--foreground)" }}
        aria-label="Search"
      >
        <Search size={20} />
      </button>
      <button
        type="button"
        onClick={onNotificationsClick}
        className="p-2 cursor-pointer rounded-full active:bg-[var(--grey-100)] transition-colors"
        style={{ color: "var(--foreground)" }}
        aria-label="Notifications"
      >
        <Bell size={20} />
      </button>
    </div>
  </div>
);

export default ScreenHeader;
