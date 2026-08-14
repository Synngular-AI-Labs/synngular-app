import React, { useState } from "react";
import { ArrowLeft, Play, Pause, Download, Star, Bot, Check } from "lucide-react";
import AudioWaveform from "./AudioWaveform";

interface TranscriptScreenProps {
  onNavigate: (
    screen:
      | "splash"
      | "signin"
      | "verify"
      | "terms"
      | "privacy"
      | "home"
      | "agents"
      | "agent-details"
      | "outputs"
      | "approvals"
      | "transcript"
  ) => void;
}

const transcriptBubbles = [
  { sender: "John", time: "9:28 AM", text: "Hello, i am john clarke." },
  { sender: "Agent", time: "9:28 AM", text: "Hello, john how may i help you today." },
  {
    sender: "John",
    time: "9:28 AM",
    text: "I want you to generate my accounts documents and email them to my contacts.",
  },
  {
    sender: "Agent",
    time: "9:28 AM",
    text: "Yes, i am generating the accounts documents and sending it through email to your contacts.",
  },
  {
    sender: "Agent",
    time: "9:28 AM",
    text: "Anything else you would like me to do john?",
  },
];

const agentActions = [
  "Accounts documents creation",
  "Emails sent to contacts",
  "Follow up action",
];

const topicTags = [
  "Documents",
  "Emails",
  "Contacts",
  "Details sent",
  "Revenue department",
  "Finance",
  "Follow-up",
];

const CallAgainButton: React.FC = () => (
  <div
    className="flex flex-col items-center justify-center pb-8"
    style={{ marginTop: 16 }}
  >
    <hr
      style={{
        width: "100%",
        maxWidth: "min(343px, 100%)",
        borderTop: "2px solid var(--grey-300)",
        marginBottom: 12,
      }}
    />
    <button
      type="button"
      onClick={() => alert("Calling again...")}
      className="flex items-center justify-center rounded-xl border text-sm font-semibold transition-colors"
      style={{
        width: "min(343px, 100%)",
        height: 40,
        borderColor: "var(--purple-1000)",
        color: "var(--purple-1000)",
        backgroundColor: "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--purple-1000)";
        (e.currentTarget as HTMLButtonElement).style.color = "white";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--purple-1000)";
      }}
    >
      Call again
    </button>
  </div>
);

const TranscriptScreen: React.FC<TranscriptScreenProps> = ({ onNavigate }) => {
  const [activeView, setActiveView] = useState<"summary" | "transcript">("summary");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isOnline] = useState(true);
  const [checkedActions, setCheckedActions] = useState<number[]>([0, 1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const toggleAction = (index: number) => {
    setCheckedActions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDownload = () => {
    alert("Downloading recording...");
  };

  return (
    <div
      className="w-full max-w-full h-full flex flex-col bg-[var(--background)] overflow-x-hidden overflow-y-auto box-border"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 24px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
      }}
    >
      {/* ── Header ── */}
      <header className="px-4 py-4 flex flex-row items-center gap-4 flex-shrink-0">
        <button
          type="button"
          onClick={() => onNavigate("agent-details")}
          className="cursor-pointer"
          style={{ color: "var(--foreground)" }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
          Transcript
        </h1>
      </header>

      {/* ── Agent info row ── */}
      <div className="px-4 flex flex-row items-center gap-3 mb-4">
        <div
          className="relative flex-shrink-0 flex items-center justify-center bg-[var(--grey-200)]"
          style={{ width: 40, height: 40, borderRadius: 8 }}
        >
          <Bot size={20} style={{ color: "var(--muted-foreground)" }} />
          {isOnline && (
            <span
              className="absolute -top-0.5 -right-0.5 rounded-full bg-green-500 border-2 border-white"
              style={{ width: 12, height: 12 }}
            />
          )}
        </div>
        <div>
          <p
            className="font-bold cursor-pointer text-sm"
            onClick={() => onNavigate("agent-details")}
            style={{ color: "var(--foreground)" }}
          >
            Revenue services
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Leads qualifications
          </p>
        </div>
      </div>

      {/* ── Stats table ── */}
      <div className="px-4 mb-4">
        <div
          className="w-full rounded-2xl border border-[var(--grey-300)] bg-[var(--grey-100)] grid grid-cols-4 divide-x divide-[var(--grey-300)] text-center text-xs box-border"
          style={{ height: 56 }}
        >
          {[
            { label: "Status", value: "Completed" },
            { label: "Duration", value: "1m 30s" },
            { label: "Start date", value: "30/06/26" },
            { label: "Type", value: "Voice" },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col justify-center">
              <div className="text-[var(--muted-foreground)] mb-1">{label}</div>
              <div
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex flex-row gap-8 px-4 border-b border-[var(--grey-200)] w-full mb-4">
        {(["summary", "transcript"] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setActiveView(view)}
            className={`py-3 ${
              activeView === view
                ? "border-b-2 border-[var(--purple-1000)] -mb-px font-semibold"
                : "border-b-2 border-transparent font-medium"
            }`}
            style={{
              color:
                activeView === view ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-grow w-full overflow-x-hidden overflow-y-auto px-4 box-border">
        {activeView === "summary" ? (
          <div className="flex flex-col" style={{ gap: 16 }}>

            {/* AI Summary */}
            <section>
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                AI Summary
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                The agent helped John clarke to generate the accounts documents and Emailed
                them after generating it to the contacts of John clarke.
              </p>
            </section>

            {/* Topics Covered */}
            <section>
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Topics Covered
              </h3>
              <div className="flex flex-row flex-wrap gap-2">
                {topicTags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-[var(--grey-300)] bg-transparent px-3 py-1 rounded-xl text-xs font-medium"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Agents Actions */}
            <section>
              <h3
                className="text-sm font-bold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Agents Actions
              </h3>
              <div className="flex flex-col gap-2">
                {agentActions.map((action, idx) => {
                  const checked = checkedActions.includes(idx);
                  return (
                    <div
                      key={action}
                      role="button"
                      onClick={() => toggleAction(idx)}
                      className="flex flex-row items-center gap-3 cursor-pointer active:scale-95 transition-transform"
                    >
                      <div
                        className={`flex-shrink-0 flex items-center justify-center rounded border transition-colors ${
                          checked
                            ? "bg-[var(--purple-1000)] border-[var(--purple-1000)]"
                            : "border-[var(--grey-1000)] bg-transparent"
                        }`}
                        style={{ width: 16, height: 16 }}
                      >
                        {checked && <Check size={10} className="text-white" />}
                      </div>
                      <span
                        className="text-sm"
                        style={{ color: "var(--foreground)" }}
                      >
                        {action}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Call Recording */}
            <section>
              <h3
                className="text-sm font-medium mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Call recording
              </h3>

              <div
                className="w-full bg-[var(--purple-1000)] rounded-xl flex flex-row items-center justify-between"
                style={{ height: 60, padding: "0 12px", boxSizing: "border-box" }}
              >
                {/* Play / Pause button */}
                <button
                  type="button"
                  onClick={() => setIsPlaying((s) => !s)}
                  className="flex-shrink-0 flex items-center justify-center rounded-full bg-white"
                  style={{ width: 40, height: 40 }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause size={16} style={{ color: "var(--purple-1000)" }} />
                  ) : (
                    <Play size={16} style={{ color: "var(--purple-1000)" }} />
                  )}
                </button>

                {/* Waveform + elapsed timer */}
                <div
                  className="flex-1 flex items-center justify-center overflow-hidden"
                  style={{ gap: 12 }}
                >
                  <AudioWaveform isPlaying={isPlaying} />
                  <span className="text-sm font-medium text-white flex-shrink-0">
                    {formatTime(elapsed)}
                  </span>
                </div>

                {/* Download */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-shrink-0 flex items-center justify-center cursor-pointer"
                  aria-label="Download recording"
                >
                  <Download size={20} className="text-white" />
                </button>
              </div>
            </section>

            {/* Rate this call */}
            <section>
              <div
                className="w-full rounded-xl px-4 py-3 flex flex-row justify-between items-center"
                style={{ backgroundColor: "var(--grey-300)" }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Rate this call
                </span>
                <div className="flex flex-row gap-1">
                  {[1, 2, 3, 4, 5].map((i) => {
                    const filled = i <= (hoverRating || rating);
                    return (
                      <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(i)}
                        className="cursor-pointer"
                        aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                      >
                        <Star
                          size={16}
                          className="transition-colors"
                          style={{
                            color: filled ? "var(--purple-1000)" : "var(--grey-500)",
                            fill: filled ? "var(--purple-1000)" : "transparent",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Call Again */}
            <CallAgainButton />

          </div>
        ) : (
          /* ── Transcript tab ── */
          <div className="flex flex-col gap-4">
            {transcriptBubbles.map((b, idx) => (
              <div key={idx} className="w-full">
                <div className="flex flex-row justify-between items-center mb-1.5">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {b.sender}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {b.time}
                  </span>
                </div>
                <div
                  className="w-full rounded-xl px-4 py-2.5 flex items-center leading-relaxed text-xs sm:text-sm font-normal"
                  style={{
                    minHeight: 37,
                    backgroundColor: "var(--grey-200)",
                    color: "var(--foreground)",
                  }}
                >
                  {b.text}
                </div>
              </div>
            ))}

            {/* Call Again */}
            <CallAgainButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptScreen;