import React, { useState } from "react";
import { ArrowLeft, ArrowUpRight, ChevronRight } from "lucide-react";

/* ── Layout Constants ─────────────────────────────────────────────── */
const SAFE_AREA_TOP = "max(env(safe-area-inset-top), 1.5rem)";
const SAFE_AREA_BOTTOM = "max(env(safe-area-inset-bottom), 1.5rem)";

/* ── Labels ───────────────────────────────────────────────────────── */
const LABELS = {
  HISTORY: "History",
  CALL_AGAIN: "Call again",
  CALLING: "Calling...",
  NO_HISTORY: "No history available.",
  BACK: "Go back",
} as const;

/* ── Types ────────────────────────────────────────────────────────── */
export interface HistoryItem {
  id: string;
  date: string;
  duration: string;
}

export interface AgentDetailsScreenProps {
  agentTitle?: string;
  agentSubtitle?: string;
  agentDescription?: string;
  historyItems?: HistoryItem[];
  onNavigate: (screen: string, payload?: Record<string, unknown>) => void;
}

/* ── Helpers ──────────────────────────────────────────────────────── */
function buildHistoryLabel(count: number): string {
  return `${LABELS.HISTORY} (${String(count).padStart(2, "0")})`;
}

/* ── History Row ──────────────────────────────────────────────────── */
interface HistoryRowProps {
  item: HistoryItem;
  isLast: boolean;
  agentTitle: string;
  agentSubtitle: string;
  onNavigate: AgentDetailsScreenProps["onNavigate"];
}

const HistoryRow: React.FC<HistoryRowProps> = ({
  item,
  isLast,
  agentTitle,
  agentSubtitle,
  onNavigate,
}) => {
  const handlePress = () => {
    onNavigate("transcript", {
      historyId: item.id,
      date: item.date,
      duration: item.duration,
      agentTitle,
      agentSubtitle,
    });
  };

  return (
    <button
      type="button"
      onClick={handlePress}
      className="w-full flex items-center gap-4 py-3 cursor-pointer text-left active:opacity-70 transition-opacity"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--grey-100)",
        background: "none",
        border: isLast ? "none" : undefined,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomStyle: "solid",
        borderBottomColor: "var(--grey-100)",
      }}
    >
      {/* Arrow icon */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{ width: "clamp(1.1rem, 4vw, 1.4rem)", height: "clamp(1.1rem, 4vw, 1.4rem)", marginRight: "0.75rem" }}
      >
        <ArrowUpRight
          style={{
            width: "100%",
            height: "100%",
            color: "var(--success-700, #16a34a)",
          }}
        />
      </div>

      {/* Date + duration */}
      <div className="flex-1 min-w-0">
        <p
          style={{
            fontSize: "clamp(0.8rem, 3.5vw, 0.875rem)",
            color: "var(--grey-700)",
            margin: 0,
          }}
        >
          {item.date}
        </p>
        <p
          style={{
            fontSize: "clamp(0.7rem, 3vw, 0.75rem)",
            color: "var(--grey-500)",
            margin: 0,
          }}
        >
          {item.duration}
        </p>
      </div>

      <ChevronRight
        style={{
          width: "clamp(1rem, 4vw, 1.25rem)",
          height: "clamp(1rem, 4vw, 1.25rem)",
          flexShrink: 0,
          color: "var(--muted-foreground)",
        }}
      />
    </button>
  );
};

/* ── Default Data ─────────────────────────────────────────────────── */
const DEFAULT_HISTORY: HistoryItem[] = [
  { id: "history-1", date: "30 June 2026", duration: "1m 30s" },
  { id: "history-2", date: "28 June 2026", duration: "2m 10s" },
  { id: "history-3", date: "25 June 2026", duration: "3m 5s" },
  { id: "history-4", date: "22 June 2026", duration: "45s" },
];

/* ── Component ────────────────────────────────────────────────────── */
const AgentDetailsScreen: React.FC<AgentDetailsScreenProps> = ({
  agentTitle = "Revenue services",
  agentSubtitle = "Leads qualification",
  agentDescription = "The agent helped qualify 2 new leads, verified contact details, and recommended next-step outreach for a higher conversion rate.",
  historyItems = DEFAULT_HISTORY,
  onNavigate,
}) => {
  const [isCalling, setIsCalling] = useState(false);

  const handleCallAgain = () => {
    setIsCalling(true);
    alert(`Initiating call with ${agentTitle}...`);
  };

  return (
    <div
      className="flex flex-col w-full h-full bg-[var(--background)]"
      style={{ paddingTop: SAFE_AREA_TOP, paddingBottom: SAFE_AREA_BOTTOM }}
    >
      {/* ── Header ── */}
      <header
        className="flex flex-row items-center px-4 py-4 flex-shrink-0"
        style={{ gap: "clamp(0.75rem, 3vw, 1rem)" }}
      >
        <button
          type="button"
          onClick={() => onNavigate("agents")}
          className="cursor-pointer flex-shrink-0"
          style={{ color: "var(--foreground)", background: "none", border: "none", padding: 0 }}
          aria-label={LABELS.BACK}
        >
          <ArrowLeft
            style={{
              width: "clamp(1.1rem, 4.5vw, 1.25rem)",
              height: "clamp(1.1rem, 4.5vw, 1.25rem)",
            }}
          />
        </button>
        <h1
          className="truncate"
          style={{
            fontSize: "clamp(1.1rem, 5vw, 1.375rem)",
            fontWeight: 700,
            color: "var(--foreground)",
            margin: 0,
          }}
        >
          {agentTitle}
        </h1>
      </header>

      {/* ── Agent description ── */}
      <div className="px-4 flex-shrink-0">
        <h2
          style={{
            fontSize: "clamp(0.8rem, 3.5vw, 0.875rem)",
            fontWeight: 600,
            color: "var(--grey-1000)",
            marginTop: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          {agentSubtitle}
        </h2>
        <p
          style={{
            fontSize: "clamp(0.7rem, 3vw, 0.75rem)",
            color: "var(--grey-700)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {agentDescription}
        </p>
      </div>

      {/* ── History header ── */}
      <div className="px-4 flex-shrink-0" style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 5vw, 1.375rem)",
            color: "var(--foreground)",
          }}
        >
          {buildHistoryLabel(historyItems.length)}
        </span>
      </div>

      {/* ── History list (scrollable) ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-[var(--spacing-12)]">
        {historyItems.length > 0 ? (
          historyItems.map((item, idx) => (
            <HistoryRow
              key={item.id}
              item={item}
              isLast={idx === historyItems.length - 1}
              agentTitle={agentTitle}
              agentSubtitle={agentSubtitle}
              onNavigate={onNavigate}
            />
          ))
        ) : (
          <p
            style={{
              fontSize: "clamp(0.7rem, 3vw, 0.75rem)",
              color: "var(--grey-500)",
              marginTop: "1rem",
            }}
          >
            {LABELS.NO_HISTORY}
          </p>
        )}
      </div>

      {/* ── Call Again button ── */}
      <div
        className="w-full shrink-0 bg-white border-t-[length:var(--border-thin)] border-[var(--grey-300)] pt-[var(--spacing-12)] pb-[env(safe-area-inset-bottom,calc(1rem))] px-4"
      >
        <button
          type="button"
          onClick={handleCallAgain}
          className={`flex items-center justify-center w-full min-h-[var(--h-btn-call-again)] rounded-[var(--border-radius-btn)] font-semibold text-body-14-m border border-[var(--purple-1000)] transition-colors duration-200 cursor-pointer ${isCalling ? "bg-[var(--purple-1000)] text-white" : "bg-transparent text-[var(--purple-1000)]"}`}
        >
          {isCalling ? LABELS.CALLING : LABELS.CALL_AGAIN}
        </button>
      </div>
    </div>
  );
};

export default AgentDetailsScreen;