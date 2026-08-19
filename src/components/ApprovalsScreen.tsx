import React, { useState } from "react";
import { Search, Bell, ChevronRight, Bot, UserCheck } from "lucide-react";
import FileOutputIcon from "./ui/FileOutputIcon";
import UserRoundCheckIcon from "./ui/UserRoundCheckIcon";
import MessageSquareTextIcon from "./ui/MessageSquareTextIcon";
import SearchBar from "./SearchBar";
import FilterBottomSheet from "./FilterBottomSheet";

interface ApprovalsScreenProps {
  onNavigate: (screen: "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "outputs" | "approvals" | "approval-details" | "notifications") => void;
}

const approvals = [
  {
    title: "Review AI-generated customer emails before sending",
    subtitle: "Hr department",
    time: "10:32 AM",
    isUrgent: false,
  },
  {
    title: "Grant access to confidential customer records",
    subtitle: "Hr operations",
    time: "10:32 AM",
    isUrgent: true,
  },
  {
    title: "Review API calls that trigger financial transactions",
    subtitle: "Hr operations",
    time: "10:32 AM",
    isUrgent: false,
  },
  {
    title: "Approve documents sent outside the organization",
    subtitle: "Hr operations",
    time: "10:32 AM",
    isUrgent: false,
  },
  {
    title: "Review AI-generated customer emails before sending",
    subtitle: "Hr operations",
    time: "10:32 AM",
    isUrgent: true,
  },
];

const ApprovalsScreen: React.FC<ApprovalsScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'urgent'>('all');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredApprovals = approvals.filter((approval) => {
    const matchesTab = activeTab === 'all' || approval.isUrgent;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      approval.title.toLowerCase().includes(query) ||
      approval.subtitle.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  return (
    <div
      className="w-full h-full flex flex-col bg-[var(--background)]"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 24px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
      }}
    >
      <header className="px-6 py-4">
        {!isSearchActive ? (
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Approvals
            </h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSearchActive(true)}
                className="p-2 cursor-pointer"
                style={{ color: "var(--foreground)" }}
              >
                <Search size={20} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate("notifications")}
                className="p-2 cursor-pointer"
                style={{ color: "var(--foreground)" }}
              >
                <Bell size={20} />
              </button>
            </div>
          </div>
        ) : (
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsSearchActive={setIsSearchActive}
            placeholder="Search approvals..."
            onFilterClick={() => setIsFilterOpen(true)}
          />
        )}
      </header>

      {/* Toggle â€” mt-4 top margin, mb-4 enforces strict 16px gap before the list */}
      <div className="flex flex-row items-center justify-center rounded-full p-1 inline-flex w-fit mx-auto mt-4 mb-4 bg-[var(--muted)]">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
              : 'bg-transparent text-[var(--muted-foreground)]'
          }`}
        >
          All (38)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('urgent')}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
            activeTab === 'urgent'
              ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
              : 'bg-transparent text-[var(--muted-foreground)]'
          }`}
        >
          Urgent (8)
        </button>
      </div>

      {/* List â€” flex-col with gap-4 gives strict 16px between every item */}
      <div className="flex-grow overflow-y-auto px-6 flex flex-col">
        {filteredApprovals.map((approval, index) => (
          <button
            key={`${approval.title}-${index}`}
            type="button"
            onClick={() => onNavigate('approval-details')}
            className="w-full flex flex-row items-start gap-4 pb-4 pt-0 border-b cursor-pointer text-left"
            style={{ borderColor: "var(--grey-100)" }}
          >
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[var(--grey-200)] flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-[var(--grey-700)]" />
            </div>
            <div className="flex-1 flex flex-col">
              <p className="text-body-14-m line-clamp-2 text-[var(--grey-1000)]">
                {approval.title}
              </p>
              <p className="text-body-12-m text-[var(--grey-700)]">
                {approval.subtitle}
              </p>
              <span className="text-captions-12 text-[var(--grey-500)] mt-2">{approval.time}</span>
            </div>
            <ChevronRight size={20} style={{ color: "var(--muted-foreground)" }} />
          </button>
        ))}
      </div>

      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={() => setIsFilterOpen(false)}
      />

      <nav
        className="w-full flex flex-row items-center justify-between border-t border-[var(--grey-100)] bg-[var(--background)]"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer transition-colors"
        >
          <MessageSquareTextIcon size={24} style={{ color: "var(--grey-700)" }} />
          <span className="text-xs font-medium text-[var(--grey-700)]">Chat</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("agents")}
          className="flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer transition-colors"
        >
          <Bot size={24} strokeWidth={1.5} style={{ color: "var(--grey-700)" }} />
          <span className="text-xs font-medium text-[var(--grey-700)]">Agent</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("outputs")}
          className="flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer transition-colors"
        >
          <FileOutputIcon size={24} style={{ color: "var(--grey-700)" }} />
          <span className="text-xs font-medium text-[var(--grey-700)]">Outputs</span>
        </button>

        <div className="relative flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-[var(--purple-1000)]" />
          <UserRoundCheckIcon size={24} style={{ color: "var(--purple-1000)" }} />
          <span className="text-xs font-medium text-[var(--purple-1000)]">Approvals</span>
        </div>
      </nav>
    </div>
  );
};

export default ApprovalsScreen;