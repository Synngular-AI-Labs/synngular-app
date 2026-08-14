import React, { useState } from "react";
import { ArrowLeft, ArrowUpRight, ChevronRight } from "lucide-react";

interface AgentDetailsScreenProps {
  onNavigate: (screen: "splash" | "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "agent-details" | "transcript") => void;
}

const historyItems = [
  { date: "30 June 2026", duration: "1m 30s" },
  { date: "28 June 2026", duration: "2m 10s" },
  { date: "25 June 2026", duration: "3m 5s" },
  { date: "22 June 2026", duration: "45s" },
];

const AgentDetailsScreen: React.FC<AgentDetailsScreenProps> = ({ onNavigate }) => {
  const [isCalling, setIsCalling] = useState(false);

  return (
    <div
      className="w-full h-full flex flex-col bg-[var(--background)]"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 24px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
      }}
    >
      <header className="px-6 py-4 flex flex-row items-center gap-4">
        <button
          type="button"
          onClick={() => onNavigate("agents")}
          className="cursor-pointer"
          style={{ color: "var(--foreground)" }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
          Revenue services
        </h1>
      </header>

      <div className="px-6 flex-shrink-0">
        <h2 className="text-base font-semibold mt-2 mb-2" style={{ color: "var(--foreground)" }}>
          Leads qualification
        </h2>
        <p className="text-sm leading-6" style={{ color: "var(--muted-foreground)" }}>
          The agent helped qualify 2 new leads, verified contact details, and recommended next-step outreach for a higher conversion rate.
        </p>
      </div>

      <div className="px-6 mt-6 flex flex-row justify-between items-center">
        <span className="font-semibold" style={{ color: "var(--foreground)" }}>
          History (08)
        </span>
        <button
          type="button"
          onClick={() => onNavigate('transcript')}
          className="text-sm cursor-pointer"
          style={{ color: "var(--foreground)" }}
        >
          Transcript
        </button>
      </div>

      <div className="flex-grow overflow-y-auto px-6 mt-4">
        {historyItems.map((item) => (
          <button
            key={item.date}
            type="button"
            onClick={() => onNavigate('transcript')}
            className="w-full flex items-center gap-4 py-3 border-b cursor-pointer text-left"
            style={{ borderColor: "var(--grey-100)" }}
          >
            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center mr-3">
              <ArrowUpRight className="w-full h-full text-[var(--success-700)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium" style={{ color: "var(--foreground)" }}>
                {item.date}
              </p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {item.duration}
              </p>
            </div>
            <ChevronRight size={20} style={{ color: "var(--muted-foreground)" }} />
          </button>
        ))}
      </div>

      <div className="p-6 flex-shrink-0 border-t" style={{ borderColor: "var(--grey-100)" }}>
        <button
          type="button"
          onClick={() => {
            setIsCalling(true);
            alert("Initiating call with Revenue services...");
          }}
          className="w-full rounded-xl border py-3 text-center font-semibold cursor-pointer transition-all active:scale-95 hover:bg-[var(--purple-1000)] hover:text-white"
          style={{ borderColor: "var(--purple-1000)", color: "var(--purple-1000)" }}
        >
          {isCalling ? "Calling..." : "Call"}
        </button>
      </div>
    </div>
  );
};

export default AgentDetailsScreen;
