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

const TabToggle: React.FC<TabToggleProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) => (
  <div
    className={`inline-flex items-center p-1 bg-[var(--grey-200)] rounded-full h-[2.8125rem] ${className}`}
  >
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => onTabChange(tab.value)}
        className={`flex items-center justify-center h-[2.3125rem] px-4 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer touch-manipulation ${
          activeTab === tab.value
            ? "bg-white text-[var(--grey-1000)] shadow-sm"
            : "text-[var(--grey-500)] hover:text-[var(--grey-1000)]"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default TabToggle;
