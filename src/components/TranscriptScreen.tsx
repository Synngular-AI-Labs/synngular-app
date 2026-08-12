import React, { useState } from "react";
import { ArrowLeft, Play, Download, CheckSquare, Square, Star, Bot } from "lucide-react";

interface TranscriptScreenProps {
  onNavigate: (screen: "splash" | "signin" | "verify" | "terms" | "privacy" | "home" | "agents" | "agent-details" | "outputs" | "approvals" | "transcript") => void;
}

const transcriptBubbles = [
  { sender: "John", time: "9:28 AM", text: "Hello, i am john clarke." },
  { sender: "Agent", time: "9:28 AM", text: "Hello, john how may i help you today." },
  { sender: "John", time: "9:28 AM", text: "I want you to generate my accounts documents and email them to my contacts." },
  { sender: "Agent", time: "9:28 AM", text: "Yes, i am generating the accounts documents and sending it through email to your contacts." },
  { sender: "Agent", time: "9:28 AM", text: "Anything else you would like me to do john?" },
];

const TranscriptScreen: React.FC<TranscriptScreenProps> = ({ onNavigate }) => {
  const [activeView, setActiveView] = useState<'summary' | 'transcript'>('summary');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div
      className="w-full max-w-full h-full flex flex-col bg-[var(--background)] overflow-x-hidden overflow-y-auto box-border"
      style={{ paddingTop: "max(env(safe-area-inset-top), 24px)", paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
    >
      <header className="px-6 py-4 flex flex-row items-center gap-4 flex-shrink-0">
        <button type="button" onClick={() => onNavigate('agent-details')} className="cursor-pointer" style={{ color: 'var(--foreground)' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Transcript</h1>
      </header>

      <div className="px-6 py-3 flex flex-row justify-between items-center flex-shrink-0 mb-4">
        <div className="flex flex-row items-center gap-3">
          <div className="relative w-[40px] h-[40px] rounded-xl bg-[var(--grey-200)] flex items-center justify-center">
            <Bot size={20} className="w-[20px] h-[20px]" style={{ color: 'var(--muted-foreground)' }} />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-[11px] h-[11px] rounded-full bg-green-600 border border-[var(--background)]" />
            )}
          </div>
          <div>
            <p className="font-bold cursor-pointer" onClick={() => onNavigate('agent-details')} style={{ color: 'var(--foreground)' }}>
              Revenue services
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Leads qualifications
            </p>
          </div>
        </div>

        <button
          type="button"
          className="w-[88px] h-[32px] rounded-xl border border-[var(--purple-1000)] text-[var(--purple-1000)] text-xs font-semibold flex items-center justify-center hover:bg-[var(--purple-1000)] hover:text-white transition-colors cursor-pointer"
          onClick={() => alert('Calling again...')}
        >
          Call again
        </button>
      </div>

      <div className="mx-6 my-3 w-full max-w-[343px] mx-auto h-[56px] rounded-2xl border border-[var(--grey-300)] bg-[var(--grey-100)] grid grid-cols-4 divide-x divide-[var(--grey-300)] text-center text-xs box-border mb-4">
        <div className="w-full h-[56px] flex flex-col justify-center">
          <div className="text-[var(--muted-foreground)] mb-1">Status</div>
          <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Completed</div>
        </div>
        <div className="w-full h-[56px] flex flex-col justify-center">
          <div className="text-[var(--muted-foreground)] mb-1">Duration</div>
          <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>1m 30s</div>
        </div>
        <div className="w-full h-[56px] flex flex-col justify-center">
          <div className="text-[var(--muted-foreground)] mb-1">Start date</div>
          <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>30/06/26</div>
        </div>
        <div className="w-full h-[56px] flex flex-col justify-center">
          <div className="text-[var(--muted-foreground)] mb-1">Type</div>
          <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Voice</div>
        </div>
      </div>

      <div className="flex flex-row gap-8 px-6 border-b border-[var(--grey-200)] w-full mt-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveView('summary')}
          className={`py-3 ${activeView === 'summary' ? 'border-b-2 border-[var(--purple-1000)] -mb-[1px] text-[var(--foreground)] font-semibold pb-2' : 'border-b-2 border-transparent text-[var(--muted-foreground)] font-medium pb-2'}`}
        >
          Summary
        </button>
        <button
          type="button"
          onClick={() => setActiveView('transcript')}
          className={`py-3 ${activeView === 'transcript' ? 'border-b-2 border-[var(--purple-1000)] -mb-[1px] text-[var(--foreground)] font-semibold pb-2' : 'border-b-2 border-transparent text-[var(--muted-foreground)] font-medium pb-2'}`}
        >
          Transcript
        </button>
      </div>

      <div className="flex-grow w-full max-w-full overflow-x-hidden overflow-y-auto px-6 py-4 mt-4 space-y-6 box-border">
        {activeView === 'summary' ? (
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>AI Summary</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              The agent helped John clarke to generate the accounts documents and Emailed them after generating it to the contacts of John clarke.
            </p>

            <div>
              <h3 className="text-sm font-semibold mt-4 mb-2" style={{ color: 'var(--foreground)' }}>Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {['Documents', 'Emails', 'Contacts', 'Details sent', 'Revenue department', 'Finance', 'Follow-up'].map((t) => (
                  <span key={t} className="border border-[var(--grey-300)] bg-transparent text-[var(--muted-foreground)] px-3 py-1 rounded-xl text-xs font-medium">{t}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--foreground)' }}>Agents Actions</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <CheckSquare size={18} style={{ color: 'var(--purple-1000)' }} />
                  <span className="text-xs" style={{ color: 'var(--foreground)' }}>Accounts documents creation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare size={18} style={{ color: 'var(--purple-1000)' }} />
                  <span className="text-xs" style={{ color: 'var(--foreground)' }}>Emails sent to contacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square size={18} style={{ color: 'var(--muted-foreground)' }} />
                  <span className="text-xs" style={{ color: 'var(--foreground)' }}>Follow up action</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Call recording</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--purple-1000)] flex items-center justify-center text-white">
                  <Play size={16} />
                </div>
                <div className="flex-1">
                  <div className="w-full h-2 bg-[var(--card)] rounded-full overflow-hidden">
                    <div className="h-2 bg-[var(--purple-1000)] rounded-full w-[40%]" />
                  </div>
                  <div className="flex flex-row justify-between text-xs text-[var(--muted-foreground)] mt-1">
                    <span>0:00</span>
                    <div className="flex items-center gap-3">
                      <span>1:30</span>
                      <button type="button" className="cursor-pointer" style={{ color: 'var(--purple-1000)' }}>
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full h-[37px] border border-[var(--grey-100)] rounded-xl px-4 flex flex-row items-center justify-between">
                <div className="text-sm text-[var(--foreground)]">Rate this call</div>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map((i) => {
                    const filled = i <= (hoverRating || rating);
                    return (
                      <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(i)}
                        className="cursor-pointer"
                      >
                        <Star size={18} style={filled ? { color: 'var(--purple-1000)', fill: 'var(--purple-1000)' } : { color: 'var(--purple-1000)', fill: 'none' }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {transcriptBubbles.map((b, idx) => (
              <div key={idx} className="w-full max-w-[343px] min-h-[37px] mx-auto">
                <div className="flex flex-row justify-between items-center mb-1.5 px-0.5">
                  <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{b.sender}</span>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{b.time}</span>
                </div>
                <div className="w-full max-w-full min-h-[37px] bg-[var(--grey-200)] rounded-xl px-4 py-2.5 flex items-center text-[var(--foreground)] leading-relaxed text-xs sm:text-sm font-normal">
                  {b.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptScreen;
