import React, { useState } from "react";
import { Search, Bell, User, ChevronRight, Bot, FileText, MessageSquare, UserCheck, X } from "lucide-react";
import SearchBar from "./SearchBar";
import FilterBottomSheet from "./FilterBottomSheet";

interface ApprovalsScreenProps {
  onNavigate: (screen: "splash" | "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "outputs" | "approvals" | "approval-details") => void;
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
                onClick={() => alert("Notifications clicked")}
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

      <div className="flex flex-row items-center justify-center rounded-full p-1 inline-flex w-fit mx-auto mt-4 bg-[var(--muted)]">
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

      <div className="flex-grow overflow-y-auto px-6 mt-6 flex flex-col">
        {filteredApprovals.map((approval, index) => (
          <button
            key={`${approval.title}-${index}`}
            type="button"
            onClick={() => onNavigate('approval-details')}
            className="w-full flex flex-row items-start gap-4 py-4 border-b cursor-pointer text-left"
            style={{ borderColor: "var(--grey-100)" }}
          >
            <div className="w-10 h-10 rounded-full bg-[var(--grey-100)] flex items-center justify-center text-[var(--muted-foreground)]">
              <User size={18} />
            </div>
            <div className="flex-1 flex flex-col">
              <p className="text-sm font-medium line-clamp-2" style={{ color: "var(--foreground)" }}>
                {approval.title}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {approval.subtitle} • {approval.time}
              </p>
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

      <nav className="flex justify-around items-center py-3 border-t" style={{ borderTopColor: "var(--border)" }}>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex flex-col items-center pt-2 cursor-pointer"
          style={{ color: "var(--muted-foreground)" }}
        >
          <MessageSquare size={20} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-xs mt-1">Chat</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('agents')}
          className="flex flex-col items-center pt-2 cursor-pointer"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Bot size={20} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-xs mt-1">Agent</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('outputs')}
          className="flex flex-col items-center pt-2 cursor-pointer"
          style={{ color: "var(--muted-foreground)" }}
        >
          <FileText size={20} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-xs mt-1">Outputs</span>
        </button>

        <div className="flex flex-col items-center pt-2" style={{ borderTopWidth: 3, borderTopStyle: 'solid', borderTopColor: 'var(--purple-1000)' }}>
          <div className="flex flex-col items-center" style={{ color: "var(--purple-1000)" }}>
            <UserCheck size={20} style={{ color: "var(--purple-1000)" }} />
            <span className="text-xs mt-1" style={{ color: "var(--purple-1000)" }}>Approvals</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default ApprovalsScreen;
