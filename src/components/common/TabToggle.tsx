import React from "react";

/* ── Types ──────────────────────────────────────────────────────────── */

export interface TabToggleTab {
  label: string;
  value: string;
}

export interface TabToggleProps {
  tabs: TabToggleTab[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

/* ── Component ──────────────────────────────────────────────────────── */

// Single global size/style for every pill toggle in the app (Agents, Approvals, …).
// Change padding/colors here, not per-screen — every usage picks it up automatically.
const TabToggle: React.FC<TabToggleProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) => (
  <div
    className={`inline-flex items-center rounded-full p-1 bg-[var(--muted)] ${className}`}
  >
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => onTabChange(tab.value)}
        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer touch-manipulation ${
          activeTab === tab.value
            ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
            : "bg-transparent text-[var(--muted-foreground)]"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default TabToggle;
