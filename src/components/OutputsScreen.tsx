import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Download, Bot } from "lucide-react";
import FileOutputIcon from "./ui/FileOutputIcon";
import UserRoundCheckIcon from "./ui/UserRoundCheckIcon";
import MessageSquareTextIcon from "./ui/MessageSquareTextIcon";
import SearchBar from "./SearchBar";
import FilterBottomSheet from "./FilterBottomSheet";
import ScreenHeader from "./common/ScreenHeader";
import { listOutputs, type OutputSummary } from "../lib/api/outputs";
import { ApiError } from "../lib/api/client";

interface OutputsScreenProps {
  onNavigate: (screen: "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "agent-details" | "outputs" | "approvals" | "notifications") => void;
  setSelectedOutput?: (output: OutputSummary) => void;
  isKeyboardOpen: boolean;
  projectId: string;
}

/* ── Helpers ── */
function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// The list endpoint doesn't expose block/kind info (only the detail endpoint does),
// so there's nothing to base an icon guess on here — every row gets the same icon.
function getIconForOutput(_output: OutputSummary): { Icon: typeof FileText; color: string } {
  return { Icon: FileText, color: "var(--error-700)" };
}

const OutputsScreen: React.FC<OutputsScreenProps> = ({ onNavigate, setSelectedOutput, isKeyboardOpen, projectId }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [outputs, setOutputs] = useState<OutputSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOutputs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listOutputs(projectId);
      setOutputs(response.data ?? []);
    } catch (err) {
      console.error("listOutputs failed:", err);
      if (err instanceof ApiError) {
        const body = err.body as { error?: string; details?: string } | undefined;
        setError(body?.details ?? body?.error ?? "Something went wrong");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchOutputs();
  }, [fetchOutputs]);

  const handleDownload = (itemName: string) => alert(`Downloading: ${itemName}`);

  const filteredOutputs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return outputs.filter(
      (output) =>
        (output.title ?? "").toLowerCase().includes(query) ||
        (output.description ?? "").toLowerCase().includes(query)
    );
  }, [outputs, searchQuery]);

  return (
    <div
      className="w-full h-full flex flex-col bg-[var(--background)] pb-[max(var(--safe-bottom),2.125rem)]"
    >
      <header className="flex-shrink-0 px-[var(--spacing-16)] pt-[max(var(--safe-top),2.75rem)] pb-3">
        {!isSearchActive ? (
          <ScreenHeader
            title="Outputs"
            onSearchClick={() => setIsSearchActive(true)}
            onNotificationsClick={() => onNavigate("notifications")}
          />
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

      <div className="flex-grow overflow-y-auto px-[var(--spacing-16)] pb-[calc(4rem+max(var(--safe-bottom),1.25rem))] flex flex-col gap-[var(--spacing-16)]">
        {isLoading && (
          <p className="text-secondary-14 text-[var(--grey-500)] text-center mt-4">Loading outputs...</p>
        )}

        {!isLoading && error && (
          <div className="text-center mt-4">
            <p className="text-secondary-14 text-[var(--error-600)]">{error}</p>
            <button
              type="button"
              onClick={fetchOutputs}
              className="text-secondary-14 text-[var(--purple-800)] font-medium mt-2 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && filteredOutputs.length === 0 && (
          <p className="text-secondary-14 text-[var(--grey-500)] text-center mt-4">No outputs found.</p>
        )}

        {!isLoading && !error && filteredOutputs.map((output) => {
          const { Icon, color: iconColor } = getIconForOutput(output);

          return (
            <div
              key={output.artifactId}
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
              <div className="flex-1 min-w-0">
                <p className="text-body-14-m text-[var(--grey-1000)] line-clamp-2">
                  {output.title}
                </p>
                <p className="text-body-12-m text-[var(--grey-700)] mt-1 truncate">
                  {output.description}
                </p>
                <p className="text-captions-12 text-[var(--grey-500)] mt-1 truncate">
                  {formatUpdatedAt(output.updatedAt)}
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
