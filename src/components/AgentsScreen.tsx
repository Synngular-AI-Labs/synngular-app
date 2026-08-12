import React, { useState } from "react";
import { Search, Bell, ChevronRight, Bot, FileText, UserCheck, X } from "lucide-react";
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
            className="w-full flex items-center gap-4 py-3 border-b cursor-pointer text-left"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--grey-100)] text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {agent.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                {agent.title}
              </p>
              <div className="flex items-center justify-between gap-4 text-[0.8rem]" style={{ color: "var(--muted-foreground)" }}>
                <span>{agent.subtitle}</span>
                <span>{agent.time}</span>
              </div>
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
        <div className="flex flex-col items-center pt-2" style={{ borderTopWidth: 3, borderTopStyle: "solid", borderTopColor: "var(--muted-foreground)" }}>
          <button type="button" onClick={() => onNavigate("home")} className="flex flex-col items-center" style={{ color: "var(--muted-foreground)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="text-xs mt-1">Chat</span>
          </button>
        </div>

        <div className="flex flex-col items-center pt-2" style={{ borderTopWidth: 3, borderTopStyle: "solid", borderTopColor: "var(--purple-1000)" }}>
          <div className="flex flex-col items-center" style={{ color: "var(--purple-1000)" }}>
            <Bot size={20} style={{ color: "var(--purple-1000)" }} />
            <span className="text-xs mt-1" style={{ color: "var(--purple-1000)" }}>Agent</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("outputs")}
          className="flex flex-col items-center pt-2 cursor-pointer"
          style={{ borderTopWidth: 3, borderTopStyle: "solid", borderTopColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          <FileText size={20} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Outputs</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("approvals")}
          className="flex flex-col items-center pt-2 cursor-pointer"
          style={{ borderTopWidth: 3, borderTopStyle: "solid", borderTopColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          <UserCheck size={20} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Approvals</span>
        </button>
      </nav>
    </div>
  );
};

export default AgentsScreen;
