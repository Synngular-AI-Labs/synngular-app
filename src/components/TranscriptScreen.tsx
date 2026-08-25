import React, { useState, useRef } from "react";
import { ArrowLeft, Phone, Play, Pause, Download, Star, Bot, Check } from "lucide-react";
import AudioWaveform from "./AudioWaveform";

/* ── Types ────────────────────────────────────────────────────────── */
// Each action's checked state is decided by the backend (whether the agent actually
// completed it) — this is display-only data, never toggled by the user in the UI.
export interface AgentAction {
  label: string;
  completed: boolean;
}

interface TranscriptScreenProps {
  agentTitle?: string;
  agentSubtitle?: string;
  date?: string;
  duration?: string;
  startDate?: string;
  callType?: string;
  status?: string;
  aiSummary?: string;
  topicTags?: string[];
  agentActions?: AgentAction[];
  audioUrl?: string;
  onNavigate: (screen: string, payload?: Record<string, unknown>) => void;
}

/* ── Audio Constants ──────────────────────────────────────────────── */
const SECONDS_IN_MINUTE = 60;
const START_TIME = 0;
const DEFAULT_TIME_DISPLAY = "0:00";
const TIME_PAD_LENGTH = 2;
const TIME_PAD_CHAR = "0";
const SAMPLE_AUDIO_URL =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

/* ── Text Constants ───────────────────────────────────────────────── */
const LABEL_CALL_RECORDING = "Call recording";
const RATE_CALL_TEXT = "Rate this call";

/* ── State Constants ──────────────────────────────────────────────── */
const DEFAULT_RATING = 0;
const DEFAULT_HOVER_RATING = 0;
const DEFAULT_IS_PLAYING = false;

/* ── Default Data ─────────────────────────────────────────────────── */
const DEFAULT_TOPIC_TAGS = [
  "Documents",
  "Emails",
  "Contacts",
  "Details sent",
  "Revenue department",
  "Finance",
  "Follow-up",
];

const DEFAULT_AGENT_ACTIONS: AgentAction[] = [
  { label: "Accounts documents creation", completed: true },
  { label: "Emails sent to contacts", completed: true },
  { label: "Follow up action", completed: false },
];

const DEFAULT_AI_SUMMARY =
  "The agent helped John Clarke to generate the accounts documents and emailed them after generating to the contacts of John Clarke.The discussion focused on improving overall revenue operations across billing, collections, and payment processing. The team reviewed the current state of the revenue cycle and identified key gaps causing delays in cash flow.Billing processes were flagged as inconsistent, with a push toward standardized electronic invoicing to reduce errors and speed up payment timelines. Collections were a major concern, particularly accounts overdue beyond 60–90 days, with a recommendation to introduce automated reminders and a dedicated follow-up team for high-value accounts.Payment processing improvements were discussed, including integrating multiple payment options and reducing manual reconciliation through automation. Compliance and regular auditing were also emphasized to ensure alignment with financial regulations.Key targets set during the session include improving the collection rate to over 90%, reducing Days Sales Outstanding (DSO) from 52 to 35 days, and bringing the claim denial rate below 5%.Overall, the consensus was to move from a reactive to a proactive revenue management approach — using automation and real-time dashboards to improve visibility, reduce leakage, and accelerate revenue growth.";

/* ── Helpers ──────────────────────────────────────────────────────── */
function formatTime(seconds: number, isNegative = false): string {
  if (isNaN(seconds) || seconds < START_TIME) return DEFAULT_TIME_DISPLAY;
  const m = Math.floor(seconds / SECONDS_IN_MINUTE);
  const s = Math.floor(seconds % SECONDS_IN_MINUTE);
  return `${isNegative ? "-" : ""}${m}:${s.toString().padStart(TIME_PAD_LENGTH, TIME_PAD_CHAR)}`;
}

/* ── Stat Cell ────────────────────────────────────────────────────── */
interface StatCellProps {
  label: string;
  value: string;
  isLast?: boolean;
}

const StatCell: React.FC<StatCellProps> = ({ label, value, isLast }) => (
  <div
    className="flex flex-col justify-center items-center"
    style={{
      flex: 1,
      borderRight: isLast ? "none" : "1px solid var(--grey-300)",
      padding: "0.5rem 0.25rem",
      minWidth: 0,
    }}
  >
    <span
      style={{
        fontSize: "clamp(0.6rem, 2.5vw, 0.7rem)",
        color: "var(--grey-500)",
        marginBottom: "0.2rem",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: "clamp(0.65rem, 2.8vw, 0.75rem)",
        fontWeight: 600,
        color: "var(--grey-700)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%",
      }}
    >
      {value}
    </span>
  </div>
);

/* ── Section Title ────────────────────────────────────────────────── */
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3
    style={{
      fontSize: "clamp(0.8rem, 3.5vw, 0.875rem)",
      fontWeight: 600,
      color: "var(--grey-1000)",
      margin: "0 0 0.5rem 0",
    }}
  >
    {children}
  </h3>
);

/* ── Main Component ───────────────────────────────────────────────── */
const TranscriptScreen: React.FC<TranscriptScreenProps> = ({
  agentTitle = "Revenue services",
  agentSubtitle = "Leads qualifications",
  duration = "1m 30s",
  startDate = "30/06/26",
  callType = "Voice",
  status = "Completed",
  aiSummary = DEFAULT_AI_SUMMARY,
  topicTags = DEFAULT_TOPIC_TAGS,
  agentActions: actionsProp = DEFAULT_AGENT_ACTIONS,
  audioUrl = SAMPLE_AUDIO_URL,
  onNavigate,
}) => {
  const [rating, setRating] = useState(DEFAULT_RATING);
  const [hoverRating, setHoverRating] = useState(DEFAULT_HOVER_RATING);
  const [isOnline] = useState(true);
  const [isPlaying, setIsPlaying] = useState(DEFAULT_IS_PLAYING);
  const [currentTime, setCurrentTime] = useState(START_TIME);
  const [audioDuration, setAudioDuration] = useState(START_TIME);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ── Play / Pause ──
     Drive isPlaying only from audio events (onPlay / onPause / onEnded),
     never from the button click. This avoids stale-state bugs where the
     promise hasn't resolved yet and the icon flips incorrectly.          */
  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {/* browser blocked — onPause event will not fire, state stays false */});
    } else {
      audio.pause();
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(START_TIME);
  };

  /* ── Dynamic timer ── */
  const roundedDuration = audioDuration > START_TIME ? Math.ceil(audioDuration) : START_TIME;
  const timerString =
    currentTime === START_TIME
      ? formatTime(roundedDuration)
      : formatTime(roundedDuration - Math.floor(currentTime), true);

  /* ── Scrub ── */
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) audioRef.current.currentTime = newTime;
  };

  const handleDownload = () => {
    window.open(audioUrl, "_blank");
  };

  const handleCallAgain = () => {
    alert(`Initiating call with ${agentTitle}...`);
  };

  const stats = [
    { label: "Status", value: status },
    { label: "Duration", value: duration },
    { label: "Start date", value: startDate },
    { label: "Type", value: callType },
  ];

  return (
    <div
      className="flex flex-col w-full h-full bg-[var(--background)] box-border pt-[max(var(--safe-top),2.75rem)]"
    >
      {/* ── Header ── */}
      <header
        style={{
          padding: "1rem",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "clamp(0.75rem, 3vw, 1rem)",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate("agent-details")}
          style={{ color: "var(--foreground)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          aria-label="Go back"
        >
          <ArrowLeft
            style={{
              width: "clamp(1.1rem, 4.5vw, 1.25rem)",
              height: "clamp(1.1rem, 4.5vw, 1.25rem)",
            }}
          />
        </button>
        <h1
          style={{
            flex: 1,
            fontSize: "clamp(1.1rem, 5vw, 1.375rem)",
            fontWeight: 700,
            color: "var(--grey-1000)",
            margin: 0,
          }}
        >
          Transcript
        </h1>
        <button
          type="button"
          onClick={handleCallAgain}
          className="w-9 h-9 flex items-center justify-center rounded-full active:bg-[var(--grey-100)] transition-colors shrink-0"
          style={{ color: "var(--foreground)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          aria-label={`Call ${agentTitle}`}
        >
          <Phone
            style={{
              width: "clamp(1.1rem, 4.5vw, 1.25rem)",
              height: "clamp(1.1rem, 4.5vw, 1.25rem)",
            }}
          />
        </button>
      </header>

      {/* ── Agent info row ── */}
      <div
        style={{
          padding: "0 1rem",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "clamp(0.6rem, 3vw, 0.75rem)",
          marginBottom: "1rem",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "relative",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--grey-200)",
            width: "clamp(2rem, 9vw, 2.5rem)",
            height: "clamp(2rem, 9vw, 2.5rem)",
            borderRadius: 8,
          }}
        >
          <Bot
            style={{
              width: "clamp(1rem, 5vw, 1.25rem)",
              height: "clamp(1rem, 5vw, 1.25rem)",
              color: "var(--muted-foreground)",
            }}
          />
          {isOnline && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: "clamp(8px, 2.5vw, 12px)",
                height: "clamp(8px, 2.5vw, 12px)",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                border: "2px solid white",
              }}
            />
          )}
        </div>
        <div>
          <p
            style={{
              fontSize: "clamp(0.85rem, 3.8vw, 1rem)",
              fontWeight: 600,
              color: "var(--grey-1000)",
              margin: 0,
              cursor: "pointer",
            }}
            onClick={() => onNavigate("agent-details")}
          >
            {agentTitle}
          </p>
          <p
            style={{
              fontSize: "clamp(0.7rem, 3vw, 0.75rem)",
              color: "var(--grey-700)",
              margin: 0,
            }}
          >
            {agentSubtitle}
          </p>
        </div>
      </div>

      {/* ── Stats table ── */}
      <div style={{ padding: "0 1rem", marginBottom: "1rem", flexShrink: 0 }}>
        <div
          style={{
            width: "100%",
            borderRadius: "1rem",
            border: "1px solid var(--grey-300)",
            backgroundColor: "var(--grey-100)",
            display: "flex",
            flexDirection: "row",
            minHeight: "clamp(3rem, 12vw, 3.5rem)",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {stats.map(({ label, value }, i) => (
            <StatCell key={label} label={label} value={value} isLast={i === stats.length - 1} />
          ))}
        </div>
      </div>

      {/* ── Scrollable body (summary content only) ── */}
      <div
        className="flex-1 overflow-x-hidden overflow-y-auto w-full px-4 box-border flex flex-col gap-5 pb-[max(var(--safe-bottom),2.125rem)]"
      >
        {/* AI Summary */}
        <section>
          <SectionTitle>AI Summary</SectionTitle>
          <p
            style={{
              fontSize: "clamp(0.7rem, 3vw, 0.75rem)",
              color: "var(--grey-700)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {aiSummary}
          </p>
        </section>

        {/* Topics Covered */}
        <section>
          <SectionTitle>Topics Covered</SectionTitle>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "clamp(0.3rem, 1.5vw, 0.5rem)",
            }}
          >
            {topicTags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "clamp(0.65rem, 2.8vw, 0.75rem)",
                  color: "var(--grey-700)",
                  border: "1px solid var(--grey-300)",
                  backgroundColor: "transparent",
                  padding: "clamp(0.2rem, 1vw, 0.25rem) clamp(0.5rem, 2vw, 0.75rem)",
                  borderRadius: "0.75rem",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Agents Actions */}
        <section>
          <SectionTitle>Agents Actions</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {actionsProp.map((action) => (
              <div
                key={action.label}
                role="checkbox"
                aria-checked={action.completed}
                aria-readonly="true"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "clamp(14px, 4vw, 16px)",
                    height: "clamp(14px, 4vw, 16px)",
                    borderRadius: "3px",
                    border: `1.5px solid ${action.completed ? "var(--purple-1000)" : "var(--grey-1000)"}`,
                    backgroundColor: action.completed ? "var(--purple-1000)" : "transparent",
                  }}
                >
                  {action.completed && (
                    <Check
                      style={{
                        width: "clamp(8px, 2.5vw, 10px)",
                        height: "clamp(8px, 2.5vw, 10px)",
                        color: "white",
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: "clamp(0.8rem, 3.5vw, 0.875rem)",
                    color: "var(--grey-700)",
                  }}
                >
                  {action.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Call Recording */}
        <section className="flex flex-col justify-center w-full pt-[var(--spacing-16)]">
          <span className="pb-[var(--spacing-label-bottom)] font-medium text-[var(--font-size-body-14-m)] leading-[var(--line-height-body-14-m)] text-[var(--grey-1000)]">
            {LABEL_CALL_RECORDING}
          </span>
          <div
            className="flex flex-row items-center w-full min-h-[var(--h-recording-container)] gap-[var(--layout-gap-12)] p-[var(--layout-gap-12)] rounded-lg bg-[var(--purple-1000)] box-border relative"
          >
            {/* Play / Pause */}
            <button
              type="button"
              onClick={handlePlayPause}
              className="flex-shrink-0 flex items-center justify-center rounded-full bg-white w-10 h-10 border-none cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-[var(--purple-1000)] fill-[var(--purple-1000)]" />
              ) : (
                <Play className="w-4 h-4 text-[var(--purple-1000)] fill-[var(--purple-1000)]" />
              )}
            </button>

            {/* Waveform + timer (scrub overlay) */}
            <div
              className="flex-1 min-h-[var(--h-audio-waves)] w-full flex items-center justify-center overflow-hidden relative gap-3"
            >
              <input
                type="range"
                min={START_TIME}
                max={audioDuration || START_TIME}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 z-10 opacity-0 cursor-pointer w-full"
                aria-label="Seek audio"
              />
              <AudioWaveform
                isPlaying={isPlaying}
                progress={audioDuration > START_TIME ? currentTime / audioDuration : START_TIME}
              />
              <span className="text-sm font-semibold text-white flex-shrink-0">
                {timerString}
              </span>
            </div>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex-shrink-0 flex items-center justify-center cursor-pointer p-0"
              style={{ background: "none", border: "none" }}
              aria-label="Download recording"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </section>

        {/* Rate this call */}
        <section className="flex justify-center w-full">
          <div
            className="flex items-center justify-between w-full min-h-[var(--h-btn-rate-call)] rounded-lg px-4 bg-[var(--grey-300)] box-border"
          >
            <span className="text-body-14-m text-[var(--grey-1000)]">
              {RATE_CALL_TEXT}
            </span>
            <div className="flex flex-row gap-1">
              {[1, 2, 3, 4, 5].map((i) => {
                const filled = i <= (hoverRating || rating);
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(DEFAULT_HOVER_RATING)}
                    onClick={() => setRating(i)}
                    className="cursor-pointer p-0.5"
                    style={{ background: "none", border: "none" }}
                    aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                  >
                    <Star
                      className="w-4 h-4 transition-colors duration-150"
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
      </div>

      {/* ── Hidden audio element ── */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setAudioDuration(audioRef.current.duration);
        }}
        onEnded={handleEnded}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default TranscriptScreen;