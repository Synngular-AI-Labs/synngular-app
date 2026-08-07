import React, { useMemo, useState } from "react";
import { Search, Bell, FileText, Code, Table, Download, Bot, UserCheck, X } from "lucide-react";

interface OutputsScreenProps {
  onNavigate: (screen: "splash" | "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "agent-details" | "outputs") => void;
}

const outputs = [
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

const OutputsScreen: React.FC<OutputsScreenProps> = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
          <div className="flex flex-row items-center gap-2 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search outputs..."
              className="flex-1 bg-[var(--grey-100)] text-[var(--foreground)] px-4 py-2 rounded-xl outline-none"
              style={{ color: "var(--foreground)" }}
            />
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearchActive(false);
              }}
              className="cursor-pointer"
              style={{ color: "var(--foreground)" }}
            >
              <X size={20} />
            </button>
          </div>
        )}
      </header>

      <div className="px-6 py-2 flex flex-row gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
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
          const Icon = output.type === "pdf" ? FileText : output.type === "code" ? Code : Table;
          return (
            <div key={output.title} className="flex items-start gap-4">
              <div className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center bg-[var(--grey-100)]">
                <Icon size={20} style={{ color: "var(--foreground)" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {output.title}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                  {output.subtitle}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                  {output.meta}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(output.title)}
                className="self-start text-[var(--purple-1000)] cursor-pointer transition-colors hover:text-[var(--purple-1000)]"
              >
                <Download size={20} />
              </button>
            </div>
          );
        })}
      </div>

      <nav className="flex justify-around items-center py-3 border-t" style={{ borderTopColor: "var(--border)" }}>
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex flex-col items-center pt-2 cursor-pointer"
          style={{ color: "var(--muted-foreground)" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="text-xs mt-1">Chat</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("agents")}
          className="flex flex-col items-center pt-2 cursor-pointer"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Bot size={20} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-xs mt-1">Agent</span>
        </button>

        <div className="flex flex-col items-center pt-2" style={{ borderTopWidth: 3, borderTopStyle: "solid", borderTopColor: "var(--purple-1000)" }}>
          <div className="flex flex-col items-center" style={{ color: "var(--purple-1000)" }}>
            <FileText size={20} style={{ color: "var(--purple-1000)" }} />
            <span className="text-xs mt-1">Outputs</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex flex-col items-center pt-2 cursor-pointer"
          style={{ color: "var(--muted-foreground)" }}
        >
          <UserCheck size={20} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-xs mt-1">Approvals</span>
        </button>
      </nav>
    </div>
  );
};

export default OutputsScreen;
