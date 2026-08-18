import React, { useMemo, useState } from "react";
import { Search, Bell, FileText, SquareCode, FileSpreadsheet, Download, Bot } from "lucide-react";
import FileOutputIcon from "./ui/FileOutputIcon";
import UserRoundCheckIcon from "./ui/UserRoundCheckIcon";
import MessageSquareTextIcon from "./ui/MessageSquareTextIcon";
import SearchBar from "./SearchBar";
import FilterBottomSheet from "./FilterBottomSheet";

interface OutputItem {
  title: string;
  subtitle: string;
  meta: string;
  type: "pdf" | "code" | "spreadsheet";
}

interface OutputsScreenProps {
  onNavigate: (screen: "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "agent-details" | "outputs" | "approvals") => void;
  setSelectedOutput?: (output: OutputItem) => void;
}

const outputs: OutputItem[] = [
  {
    title: "PDF created for HR policy",
    subtitle: "Hr department",
    meta: "10:32 AM • PDF • 1.2 MB",
    type: "pdf",
  },
  {
    title: "Code snippet package",
    subtitle: "Devops team",
    meta: "09:45 AM • Codes • 24 KB",
    type: "code",
  },
  {
    title: "Spreadsheet export",
    subtitle: "Finance review",
    meta: "08:20 AM • Spreadsheet • 520 KB",
    type: "spreadsheet",
  },
  {
    title: "PDF summary report",
    subtitle: "Legal team",
    meta: "Yesterday • PDF • 850 KB",
    type: "pdf",
  },
];

const OutputsScreen: React.FC<OutputsScreenProps> = ({ onNavigate, setSelectedOutput }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleNotifications = () => alert("Notifications clicked");
  const handleDownload = (itemName: string) => alert(`Downloading: ${itemName}`);

  const filteredOutputs = useMemo(() => {
    return outputs.filter((output) => {
      const matchesTab =
        activeFilter === "All" ||
        output.type === activeFilter.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        output.title.toLowerCase().includes(query) ||
        output.subtitle.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

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
              Outputs
            </h1>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIsSearchActive(true)} className="p-2 cursor-pointer" style={{ color: "var(--foreground)" }}>
                <Search size={20} />
              </button>
              <button type="button" onClick={handleNotifications} className="p-2 cursor-pointer" style={{ color: "var(--foreground)" }}>
                <Bell size={20} />
              </button>
            </div>
          </div>
        ) : (
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsSearchActive={setIsSearchActive}
            placeholder="Search outputs..."
            onFilterClick={() => setIsFilterOpen(true)}
          />
        )}
      </header>

      <div className="px-6 py-2 my-3 flex flex-row gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
        {[
          { label: "All", key: "All" },
          { label: "Pdf", key: "Pdf" },
          { label: "Codes", key: "Codes" },
          { label: "Spreadsheet", key: "Spreadsheet" },
        ].map((filter) => (
          <button
            type="button"
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium border ${
              activeFilter === filter.key
                ? "border-[var(--purple-1000)] text-[var(--purple-1000)] bg-transparent"
                : "border-[var(--border)] text-[var(--muted-foreground)] bg-transparent"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-y-auto px-6 mt-2 flex flex-col gap-6">
        {filteredOutputs.map((output) => {
          let Icon;
          let iconColor;

          if (output.type === "pdf") {
            Icon = FileText;
            iconColor = "var(--error-700)";
          } else if (output.type === "code") {
            Icon = SquareCode;
            iconColor = "var(--purple-800)";
          } else {
            Icon = FileSpreadsheet;
            iconColor = "var(--success-700)";
          }

          return (
            <div
              key={output.title}
              className="flex items-start gap-4 cursor-pointer active:opacity-70 transition-opacity"
              onClick={() => {
                if (setSelectedOutput) {
                  setSelectedOutput(output);
                }
              }}
            >
              <div className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center bg-[var(--grey-100)]">
                <Icon size={20} style={{ color: iconColor }} />
              </div>
              <div className="flex-1">
                <p className="text-body-14-m text-[var(--grey-1000)]">
                  {output.title}
                </p>
                <p className="text-body-12-m text-[var(--grey-700)] mt-1">
                  {output.subtitle}
                </p>
                <p className="text-captions-12 text-[var(--grey-500)] mt-1">
                  {output.meta}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(output.title);
                }}
                className="self-start text-[var(--purple-1000)] cursor-pointer transition-colors hover:text-[var(--purple-1000)]"
              >
                <Download size={20} />
              </button>
            </div>
          );
        })}
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

        <div className="relative flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-[var(--purple-1000)]" />
          <FileOutputIcon size={24} style={{ color: "var(--purple-1000)" }} />
          <span className="text-xs font-medium text-[var(--purple-1000)]">Outputs</span>
        </div>

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

export default OutputsScreen;
