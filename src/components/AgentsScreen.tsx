import React, { useState } from "react";
import { Search, Bell, ChevronRight, Bot } from "lucide-react";
import FileOutputIcon from "./ui/FileOutputIcon";
import UserRoundCheckIcon from "./ui/UserRoundCheckIcon";
import MessageSquareTextIcon from "./ui/MessageSquareTextIcon";
import SearchBar from "./SearchBar";
import FilterBottomSheet from "./FilterBottomSheet";
import TabToggle from "./common/TabToggle";

interface AgentsScreenProps {
  onNavigate: (screen: "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "agent-details" | "outputs" | "approvals") => void;
  isKeyboardOpen: boolean;
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

const AgentsScreen: React.FC<AgentsScreenProps> = ({ onNavigate, isKeyboardOpen }) => {
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
      className="w-full h-full flex flex-col bg-[var(--background)] pb-[max(var(--safe-bottom),2.125rem)]"
    >
      <header className="px-[var(--spacing-16)] pt-[max(var(--safe-top),2.75rem)] pb-3">
        {!isSearchActive ? (
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-card-title-20" style={{ color: "var(--foreground)" }}>
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

      <div className="flex justify-center mt-4">
        <TabToggle
          tabs={[
            { label: "All (38)", value: "all" },
            { label: "Favourite (8)", value: "favourites" },
          ]}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as 'all' | 'favourites')}
        />
      </div>

      <div className="flex-grow overflow-y-auto px-6 mt-4 pb-[calc(4rem+max(var(--safe-bottom),1.25rem))]">
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
                <p className="text-body-16-m text-[var(--grey-1000)] text-left w-full">{agent.title}</p>
                <p className="text-secondary-14 text-[var(--grey-700)] mt-0.5 text-left w-full">{agent.subtitle}</p>
                <span className="text-captions-12 text-[var(--grey-500)] mt-0.5 text-left w-full">{agent.time}</span>
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

      <nav className={`fixed bottom-0 left-0 w-full bg-white border-t border-[var(--grey-200)] z-40 flex px-[0.75rem] gap-[0.75rem] pt-[0.75rem] pb-[max(var(--safe-bottom),0.75rem)] transition-transform duration-200 ${isKeyboardOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <button
          onClick={() => onNavigate('home')}
          className="flex-1 h-[2.75rem] flex flex-col items-center justify-between relative touch-manipulation group"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <MessageSquareTextIcon size={24} style={{ color: 'var(--grey-500)' }} />
          </div>
          <span className="text-[0.625rem] leading-[0.75rem] font-medium text-[var(--grey-500)]">Chat</span>
        </button>

        <button
          onClick={() => onNavigate('agents')}
          className="flex-1 h-[2.75rem] flex flex-col items-center justify-between relative touch-manipulation group"
        >
          {true && (
            <div className="absolute top-[-0.75rem] left-0 w-full h-[0.125rem] bg-[var(--purple-1000)] rounded-b-sm" />
          )}
          <div className="w-6 h-6 flex items-center justify-center">
            <Bot size={24} strokeWidth={1.5} style={{ color: 'var(--purple-1000)' }} />
          </div>
          <span className="text-[0.625rem] leading-[0.75rem] font-medium text-[var(--purple-1000)]">Agent</span>
        </button>

        <button
          onClick={() => onNavigate('outputs')}
          className="flex-1 h-[2.75rem] flex flex-col items-center justify-between relative touch-manipulation group"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <FileOutputIcon size={24} style={{ color: 'var(--grey-500)' }} />
          </div>
          <span className="text-[0.625rem] leading-[0.75rem] font-medium text-[var(--grey-500)]">Outputs</span>
        </button>

        <button
          onClick={() => onNavigate('approvals')}
          className="flex-1 h-[2.75rem] flex flex-col items-center justify-between relative touch-manipulation group"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <UserRoundCheckIcon size={24} style={{ color: 'var(--grey-500)' }} />
          </div>
          <span className="text-[0.625rem] leading-[0.75rem] font-medium text-[var(--grey-500)]">Approvals</span>
        </button>
      </nav>
    </div>
  );
};

export default AgentsScreen;
