import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronRight, Bot } from "lucide-react";
import FileOutputIcon from "./ui/FileOutputIcon";
import UserRoundCheckIcon from "./ui/UserRoundCheckIcon";
import MessageSquareTextIcon from "./ui/MessageSquareTextIcon";
import SearchBar from "./SearchBar";
import FilterBottomSheet from "./FilterBottomSheet";
// import TabToggle from "./common/TabToggle";
import ScreenHeader from "./common/ScreenHeader";
import { listAgents, type Agent } from "../lib/api/agents";
import { ApiError } from "../lib/api/client";

interface AgentsScreenProps {
  onNavigate: (screen: "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "agent-details" | "outputs" | "approvals" | "notifications", payload?: Record<string, unknown>) => void;
  isKeyboardOpen: boolean;
  projectId: string;
}

/* ── Helpers ── */
function getInitials(name: string): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function formatRunCount(count: number): string {
  if (count === 0) return "No runs yet";
  return `${count} run${count === 1 ? "" : "s"}`;
}

const AgentsScreen: React.FC<AgentsScreenProps> = ({ onNavigate, isKeyboardOpen, projectId }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentRunCounts, setAgentRunCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listAgents(projectId);
      setAgents(response.agents ?? []);
      setAgentRunCounts(response.agentRunCounts ?? {});
    } catch (err) {
      console.error("listAgents failed:", err);
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
    fetchAgents();
  }, [fetchAgents]);

  const filteredAgents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return agents.filter((agent) => {
      return (
        (agent.name ?? "").toLowerCase().includes(query) ||
        (agent.description ?? "").toLowerCase().includes(query)
      );
    });
  }, [agents, searchQuery]);

  return (
    <div
      className="w-full h-full flex flex-col bg-[var(--background)] pb-[max(var(--safe-bottom),2.125rem)]"
    >
      <header className="flex-shrink-0 px-[var(--spacing-16)] pt-[max(var(--safe-top),2.75rem)] pb-3">
        {!isSearchActive ? (
          <ScreenHeader
            title="Agents"
            onSearchClick={() => setIsSearchActive(true)}
            onNotificationsClick={() => onNavigate("notifications")}
          />
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

      <div className="flex-grow overflow-y-auto flex flex-col gap-[var(--spacing-16)] px-[var(--spacing-16)] pb-[calc(4rem+max(var(--safe-bottom),1.25rem))]">
        {isLoading && (
          <p className="text-secondary-14 text-[var(--grey-500)] text-center mt-4">Loading agents...</p>
        )}

        {!isLoading && error && (
          <div className="text-center mt-4">
            <p className="text-secondary-14 text-[var(--error-600)]">{error}</p>
            <button
              type="button"
              onClick={fetchAgents}
              className="text-secondary-14 text-[var(--purple-800)] font-medium mt-2 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && filteredAgents.length === 0 && (
          <p className="text-secondary-14 text-[var(--grey-500)] text-center mt-4">No agents found.</p>
        )}

        {!isLoading && !error && filteredAgents.map((agent) => (
          <button
            key={agent.id}
            type="button"
            onClick={() =>
              onNavigate('agent-details', {
                agentId: agent.id,
                agentTitle: agent.name,
                agentSubtitle: agent.llmModelConfig?.provider?.name
                  ? `Powered by ${agent.llmModelConfig.provider.name}`
                  : agent.agentType,
                agentDescription: agent.description,
              })
            }
            className="w-full flex flex-row items-start justify-between cursor-pointer hover:bg-[var(--grey-50)] active:bg-[var(--grey-100)] transition-all"
          >
            <div className="flex flex-row items-start gap-3 flex-1">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[var(--grey-200)] flex items-center justify-center mt-0.5">
                <span className="text-sm font-bold text-[var(--grey-700)]">{getInitials(agent.name)}</span>
              </div>

              <div className="flex flex-col flex-1 items-start text-left min-w-0 ml-3">
                <p className="text-body-16-m text-[var(--grey-1000)] text-left w-full">{agent.name}</p>
                <p className="text-secondary-14 text-[var(--grey-700)] mt-0.5 text-left w-full">
                  {agent.llmModelConfig?.provider?.name ? `Powered by ${agent.llmModelConfig.provider.name}` : agent.agentType}
                </p>
                <span className="text-captions-12 text-[var(--grey-500)] mt-0.5 text-left w-full">
                  {formatRunCount(agentRunCounts[agent.id] ?? 0)}
                </span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)] flex-shrink-0 ml-2 mt-0.5" />
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
