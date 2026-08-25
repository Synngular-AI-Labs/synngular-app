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
  isKeyboardOpen: boolean;
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

const OutputsScreen: React.FC<OutputsScreenProps> = ({ onNavigate, setSelectedOutput, isKeyboardOpen }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleNotifications = () => alert("Notifications clicked");
  const handleDownload = (itemName: string) => alert(`Downloading: ${itemName}`);

  const filteredOutputs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return outputs.filter(
      (output) =>
        output.title.toLowerCase().includes(query) ||
        output.subtitle.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div
      className="w-full h-full flex flex-col bg-[var(--background)] pb-[max(var(--safe-bottom),2.125rem)]"
    >
      <header className="px-[var(--spacing-16)] pt-[max(var(--safe-top),2.75rem)] pb-3">
        {!isSearchActive ? (
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-card-title-20" style={{ color: "var(--foreground)" }}>
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

      <div className="flex-grow overflow-y-auto px-6 mt-2 pb-[calc(4rem+max(var(--safe-bottom),1.25rem))] flex flex-col gap-6">
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
          <div className="w-6 h-6 flex items-center justify-center">
            <Bot size={24} strokeWidth={1.5} style={{ color: 'var(--grey-500)' }} />
          </div>
          <span className="text-[0.625rem] leading-[0.75rem] font-medium text-[var(--grey-500)]">Agent</span>
        </button>

        <button
          onClick={() => onNavigate('outputs')}
          className="flex-1 h-[2.75rem] flex flex-col items-center justify-between relative touch-manipulation group"
        >
          {true && (
            <div className="absolute top-[-0.75rem] left-0 w-full h-[0.125rem] bg-[var(--purple-1000)] rounded-b-sm" />
          )}
          <div className="w-6 h-6 flex items-center justify-center">
            <FileOutputIcon size={24} style={{ color: 'var(--purple-1000)' }} />
          </div>
          <span className="text-[0.625rem] leading-[0.75rem] font-medium text-[var(--purple-1000)]">Outputs</span>
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

export default OutputsScreen;
