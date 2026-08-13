import React, { useState } from "react";
import { Search, Bell, ChevronRight, Bot } from "lucide-react";
import FileOutputIcon from "./ui/FileOutputIcon";
import UserRoundCheckIcon from "./ui/UserRoundCheckIcon";
import MessageSquareTextIcon from "./ui/MessageSquareTextIcon";
import SearchBar from "./SearchBar";
import FilterBottomSheet from "./FilterBottomSheet";

interface AgentsScreenProps {
  onNavigate: (screen: "splash" | "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "agent-details" | "outputs" | "approvals") => void;
}

const agents = [
  { initials: "RS", title: "Revenue services", subtitle: "Leads qualification", time: "5min ago", isFavourite: true },
  { initials: "SA", title: "Sales assistant", subtitle: "Calls customers", time: "1hr ago", isFavourite: true },
  { initials: "CS", title: "Customer support", subtitle: "Handles customer inquiries", time: "10hr ago", isFavourite: false },
  { initials: "BS", title: "Billing specialist", subtitle: "Generate sales bills", time: "1d ago" },
  { initials: "OG", title: "Onboarding guide", subtitle: "Leads qualification", time: "10d ago" },
  { initials: "HR", title: "HR operations", subtitle: "Candidate selection", time: "1mon ago" },
  { initials: "DG", title: "Design guide", subtitle: "Creative strategy", time: "2mon ago" },
];

const AgentsScreen: React.FC<AgentsScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'favourites'>('all');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredAgents = agents.filter((agent) => {
    const matchesTab = activeTab === 'all' || agent.isFavourite;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      agent.title.toLowerCase().includes(query) ||
      agent.subtitle.toLowerCase().includes(query);
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
              Agents
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
            placeholder="Search agents..."
            onFilterClick={() => setIsFilterOpen(true)}
          />
        )}
      </header>

      <div className="flex flex-row items-center justify-center rounded-full p-1 inline-flex w-fit mx-auto mt-4 bg-[var(--muted)]">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === 'all' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'bg-transparent text-[var(--muted-foreground)]'}`}
        >
          All (38)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('favourites')}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === 'favourites' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'bg-transparent text-[var(--muted-foreground)]'}`}
        >
          Favourite (8)
        </button>
      </div>

      <div className="flex-grow overflow-y-auto px-6 mt-4">
        {filteredAgents.map((agent) => (
          <button
            key={agent.title}
            type="button"
            onClick={() => onNavigate('agent-details')}
            className="w-full flex flex-row items-center justify-between py-3 cursor-pointer hover:bg-[var(--grey-50)] active:bg-[var(--grey-100)] transition-all"
          >
            <div className="flex flex-row items-center gap-3 flex-1">
              <div className="w-[40px] h-[40px] flex-shrink-0 rounded-full bg-[var(--grey-200)] flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--grey-700)]">{agent.initials}</span>
              </div>

              <div className="flex flex-col flex-1 items-start text-left min-w-0 ml-3">
                <p className="text-sm font-semibold text-[var(--foreground)] text-left w-full">{agent.title}</p>
                <p className="text-xs font-medium text-[var(--muted-foreground)] mt-0.5 text-left w-full">{agent.subtitle}</p>
                <span className="text-[10px] font-medium text-[var(--grey-400)] mt-0.5 text-left w-full">{agent.time}</span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)] flex-shrink-0 ml-2" />
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

        <div className="relative flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-[var(--purple-1000)]" />
          <Bot size={24} style={{ color: "var(--purple-1000)" }} />
          <span className="text-xs font-medium text-[var(--purple-1000)]">Agent</span>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("outputs")}
          className="flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer transition-colors"
        >
          <FileOutputIcon size={24} style={{ color: "var(--grey-700)" }} />
          <span className="text-xs font-medium text-[var(--grey-700)]">Outputs</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("approvals")}
          className="flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer transition-colors"
        >
          <UserRoundCheckIcon size={24} style={{ color: "var(--grey-700)" }} />
          <span className="text-xs font-medium text-[var(--grey-700)]">Approvals</span>
        </button>
      </nav>
    </div>
  );
};

export default AgentsScreen;
