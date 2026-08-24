import React, { useEffect, useRef, useState } from "react";
import logoAsset from "../assets/logo.png";
import { M3 } from "tauri-plugin-m3";
import {
  Menu,
  Bell,
  Bot,
} from "lucide-react";
import FileOutputIcon from "./ui/FileOutputIcon";
import UserRoundCheckIcon from "./ui/UserRoundCheckIcon";
import MessageSquareTextIcon from "./ui/MessageSquareTextIcon";

// â”€â”€ Recents Dummy Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const recentItems = [
  { id: 1, title: "Contract analysis", time: "2m ago" },
  { id: 2, title: "Customer Support Ticket Summary...", time: "2m ago" },
  { id: 3, title: "HR Candidate Screening", time: "2m ago" },
  { id: 4, title: "Sales Lead Analysis", time: "2m ago" },
  { id: 5, title: "Invoice Processing", time: "2m ago" },
  { id: 6, title: "Marketing Campaign Ideas", time: "2m ago" },
  { id: 7, title: "Employee Onboarding Workflow", time: "2m ago" },
  { id: 8, title: "Quarterly Sales Report", time: "2m ago" },
  { id: 9, title: "Vendor Comparison", time: "2m ago" },
  { id: 10, title: "Expense Report Review", time: "2m ago" },
  { id: 11, title: "Product Requirements Draft", time: "2m ago" },
  { id: 12, title: "Project Status Update", time: "2m ago" },
  { id: 13, title: "Lead Qualification", time: "2m ago" },
  { id: 14, title: "Policy Document Summary", time: "2m ago" },
  { id: 15, title: "Recruitment Pipeline Review", time: "2m ago" },
  { id: 16, title: "Q3 Financial Review", time: "2m ago" },
  { id: 17, title: "New Hire Onboarding Doc", time: "2m ago" },
  { id: 18, title: "Sales Pitch Transcript", time: "2m ago" },
  { id: 19, title: "Client Feedback Analysis", time: "2m ago" },
  { id: 20, title: "Weekly Sync Notes", time: "2m ago" },
  { id: 21, title: "Product Roadmap Update", time: "2m ago" },
  { id: 22, title: "Legal Compliance Check", time: "2m ago" },
  { id: 23, title: "Bug Triage Summary", time: "2m ago" },
  { id: 24, title: "User Research Insights", time: "2m ago" },
  { id: 25, title: "Marketing Copy Generation", time: "2m ago" },
  { id: 26, title: "Competitor Analysis", time: "2m ago" },
  { id: 27, title: "API Integration Docs", time: "2m ago" },
  { id: 28, title: "Security Audit Report", time: "2m ago" },
  { id: 29, title: "Social Media Strategy", time: "2m ago" },
  { id: 30, title: "Design System Review", time: "2m ago" },
];

interface HomeScreenProps {
  onNavigate: (
    screen:
      | "signin"
      | "verify"
      | "terms"
      | "privacy"
      | "home"
      | "agents"
      | "outputs"
      | "approvals"
      | "notifications"
  ) => void;
  isKeyboardOpen: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, isKeyboardOpen }) => {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<{ url: string; loading: boolean } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecentsOpen, setIsRecentsOpen] = useState(false);
  const [messages, setMessages] = useState<
    {
      id: string;
      text: string;
      isUser: boolean;
      files?: { url: string; type: string; name: string }[];
    }[]
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileUrlsRef = useRef<string[]>([]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      fileUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      fileUrlsRef.current = [];
    };
  }, []);

  // Set Tauri status bar theme
  useEffect(() => {
    const configureStatusBar = async () => {
      try {
        await M3.setBarColor("dark");
        await M3.setStatusBarTranslucent(true);
      } catch (error) {
        console.error("M3 status bar error:", error);
      }
    };
    configureStatusBar();
  }, []);

  // Detect mobile software keyboard via Visual Viewport API
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const isKeyboardOpen =
        window.visualViewport!.height < window.innerHeight * 0.85;
      setIsTyping(isKeyboardOpen);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.visualViewport!.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSend = () => {
    if (!message.trim() && !attachment) return;

    const fileData: { url: string; type: string; name: string }[] = [];

    if (attachment) {
      fileData.push({ url: attachment.url, type: "image/*", name: "attachment" });
    }

    setMessages((current) => [
      ...current,
      {
        id: Date.now().toString(),
        text: message.trim(),
        isUser: true,
        files: fileData,
      },
    ]);
    setMessage("");
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAttachment({ url, loading: true });
    setTimeout(() => {
      setAttachment(prev => prev ? { ...prev, loading: false } : null);
    }, 2000);
  };

  const navHidden = isKeyboardOpen || isTyping;

  return (
    /*
     * Root shell:
     * - Uses 100dvh so it fills the visual viewport on every device.
     * - Padding respects safe-area insets for notches / home indicators.
     * - overflow-hidden prevents any child from accidentally expanding past the viewport.
     */
    <div
      className="flex flex-col bg-[var(--background)] overflow-hidden"
      style={{
        height: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* â”€â”€ Header â”€â”€ */}
      <header className="relative z-30 w-full px-6 py-4 flex flex-row items-center justify-between flex-shrink-0 bg-[var(--background)]">
        <button
          type="button"
          aria-label="Open menu"
          onClick={(e) => {
            e.stopPropagation();
            setIsRecentsOpen(true);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--foreground)] hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)] cursor-pointer touch-manipulation z-30"
        >
          <Menu className="w-6 h-6" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.("notifications");
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--foreground)] hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)] cursor-pointer touch-manipulation z-30"
        >
          <Bell className="w-6 h-6" />
        </button>
      </header>

      {/* â”€â”€ Body â”€â”€ */}
      {messages.length === 0 ? (
        // â”€â”€ Empty / welcome state â”€â”€
        <div className="flex flex-col flex-1 w-full min-h-0">
          <main className="flex-1 flex flex-col items-center justify-center w-full px-6 pb-[calc(4rem+max(env(safe-area-inset-bottom),1.25rem))] min-h-0">
            <img
              src={logoAsset}
              alt="Logo"
              className="w-[10vw] aspect-[71/70.01] max-w-[100px] min-w-[72px] object-contain mx-auto mb-4"
            />
            <h1
              className="text-4xl font-semibold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Welcome back
            </h1>
            <p
              className="text-lg font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              What do you want to achieve, today?
            </p>
          </main>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />

          {/* Chat Input Container */}
          {/* Added dynamic bottom margin to sit exactly 16px (1rem) above the 75px (4.6875rem) nav bar */}
          <div className="w-full px-[var(--spacing-16)] mb-[calc(4.6875rem+max(env(safe-area-inset-bottom),0.75rem)+1rem)] mt-auto flex-shrink-0 relative z-20">
            <div className="w-full bg-white border border-[var(--grey-200)] rounded-[1.25rem] px-[0.75rem] py-[0.5rem] flex flex-col shadow-sm transition-all duration-200">

              {/* Attachment Preview — expands upward inside the box */}
              {attachment && (
                <div className="pt-1 pb-2 relative w-[4.5rem] h-[4.5rem] ml-1 animate-in fade-in zoom-in duration-200">
                  <img
                    src={attachment.url}
                    alt="Attachment"
                    className="w-full h-full object-cover rounded-xl border border-[var(--grey-200)]"
                  />
                  {attachment.loading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                      <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={() => setAttachment(null)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-black/70 text-white rounded-full flex items-center justify-center shadow-md touch-manipulation hover:bg-black transition-colors z-10"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* Text Input Row - Hugs content, minimum 32px height */}
              <div className="flex items-end gap-2 w-full min-h-[2rem]">

                {/* Plus (Attach) Button */}
                <button
                  onClick={handleAttachClick}
                  className="w-8 h-8 shrink-0 flex items-center justify-center text-[var(--grey-500)] mb-[0.125rem] active:bg-[var(--grey-100)] rounded-full transition-colors touch-manipulation"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>

                {/* Auto-resizing Textarea */}
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInput}
                  rows={1}
                  placeholder="Type a message here..."
                  className="flex-1 max-h-[8rem] bg-transparent resize-none py-[0.375rem] text-[0.875rem] leading-[1.3125rem] text-[var(--grey-1000)] focus:outline-none placeholder:text-[var(--grey-400)] overflow-y-auto self-center"
                />

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center mb-[0.125rem] transition-colors touch-manipulation text-white ${(message.trim().length > 0 || attachment) ? 'bg-[var(--purple-1000)]' : 'bg-[#643388]'}`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // â”€â”€ Active chat state â”€â”€
        <div className="flex flex-col flex-1 w-full min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto w-full px-6 py-4 pb-[calc(4rem+max(env(safe-area-inset-bottom),1.25rem))] flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex w-full justify-end mb-4 px-[var(--spacing-16)]">
                <div className="max-w-[85%] bg-[#F9F9FA] text-[var(--grey-900)] rounded-[1rem] px-[0.75rem] py-[0.6875rem] shadow-sm">
                  <p className="text-[0.875rem] leading-[1.3125rem] break-words whitespace-pre-wrap font-normal">
                    {msg.text}
                  </p>
                  {msg.files && msg.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.files.map((file, index) =>
                        file.type.startsWith("image/") ? (
                          <img
                            key={`${file.name}-${index}`}
                            src={file.url}
                            alt={file.name}
                            className="w-16 h-16 rounded-lg object-cover border border-[var(--grey-200)]"
                          />
                        ) : (
                          <div
                            key={`${file.name}-${index}`}
                            className="w-16 h-16 rounded-lg bg-[var(--grey-100)] flex flex-col items-center justify-center truncate p-1 text-[var(--grey-900)]"
                          >
                          ðŸ“„
                          <span className="mt-1 text-center truncate text-[0.5rem]">
                            {file.name}
                          </span>
                        </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />

          {/* Chat Input Container - Clear nav bar with 1rem gap */}
          <div className="w-full px-[var(--spacing-16)] mb-[calc(4.6875rem+max(env(safe-area-inset-bottom),0.75rem)+1rem)] mt-auto flex-shrink-0 relative z-20">
            <div className="w-full bg-white border border-[var(--grey-200)] rounded-[1.25rem] px-[0.75rem] py-[0.5rem] flex flex-col shadow-sm transition-all duration-200">

              {/* Attachment Preview — expands upward inside the box */}
              {attachment && (
                <div className="pt-1 pb-2 relative w-[4.5rem] h-[4.5rem] ml-1 animate-in fade-in zoom-in duration-200">
                  <img
                    src={attachment.url}
                    alt="Attachment"
                    className="w-full h-full object-cover rounded-xl border border-[var(--grey-200)]"
                  />
                  {attachment.loading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                      <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={() => setAttachment(null)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-black/70 text-white rounded-full flex items-center justify-center shadow-md touch-manipulation hover:bg-black transition-colors z-10"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* Text Input Row - Hugs content, minimum 32px height */}
              <div className="flex items-end gap-2 w-full min-h-[2rem]">

                {/* Plus (Attach) Button */}
                <button
                  onClick={handleAttachClick}
                  className="w-8 h-8 shrink-0 flex items-center justify-center text-[var(--grey-500)] mb-[0.125rem] active:bg-[var(--grey-100)] rounded-full transition-colors touch-manipulation"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>

                {/* Auto-resizing Textarea */}
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInput}
                  rows={1}
                  placeholder="Type a message here......"
                  className="flex-1 max-h-[8rem] bg-transparent resize-none py-1.5 text-[0.875rem] leading-[1.3125rem] text-[var(--grey-1000)] focus:outline-none placeholder:text-[var(--grey-400)] overflow-y-auto self-center"
                />

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center mb-[0.125rem] transition-colors touch-manipulation ${(message.trim().length > 0 || attachment) ? 'bg-[var(--purple-1000)]' : 'bg-[#643388]'} text-white`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Bottom Nav â”€â”€ */}
      <nav className={`fixed bottom-0 left-0 w-full bg-white border-t border-[var(--grey-200)] z-40 flex px-[0.75rem] gap-[0.75rem] pt-[0.75rem] pb-[max(env(safe-area-inset-bottom),0.75rem)] transition-transform duration-200 ${navHidden ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <button
          onClick={() => onNavigate('home')}
          className="flex-1 h-[2.75rem] flex flex-col items-center justify-between relative touch-manipulation group"
        >
          {true && (
            <div className="absolute top-[-0.75rem] left-0 w-full h-[0.125rem] bg-[var(--purple-1000)] rounded-b-sm" />
          )}
          <div className="w-6 h-6 flex items-center justify-center">
            <MessageSquareTextIcon size={24} style={{ color: 'var(--purple-1000)' }} />
          </div>
          <span className="text-[0.625rem] leading-[0.75rem] font-medium text-[var(--purple-1000)]">Chat</span>
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

      {/* â”€â”€ Backdrop Overlay â”€â”€ */}
      <div
        className={`fixed inset-0 z-40 bg-[var(--grey-500)] transition-opacity duration-300 ${
          isRecentsOpen
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setIsRecentsOpen(false);
        }}
      />

      {/*
       * â”€â”€ Recents Side Panel â”€â”€
       *
       * KEY FIX: The panel is anchored with fixed positioning to the true
       * viewport edges (top:0, left:0, height:100dvh).  It does NOT inherit
       * the parent's safe-area padding, so it always fills edge-to-edge on
       * every device size regardless of notch / home-indicator geometry.
       *
       * Internal padding is applied explicitly inside the panel so content
       * is still clear of hardware-level safe zones.
       */}
      <div
        aria-modal="true"
        role="dialog"
        aria-label="Recents"
        className={`fixed top-0 left-0 z-50 h-[100dvh] bg-white transition-transform duration-300 ease-in-out ${
          isRecentsOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          // Panel takes up all-but a configurable right gap so the user can
          // tap the exposed backdrop to dismiss.  Uses CSS custom properties
          // when defined, otherwise falls back to a sensible fixed value.
          width:
            "min(calc(100vw - var(--panel-overlay-gap, 3.5rem)), var(--panel-max-w, 20rem))",
        }}
      >
        {/*
         * Inner wrapper handles safe-area padding independently from the
         * app shell.  pt accounts for status-bar / notch; pb accounts for
         * home indicator.  Both use max() so there is always at least a
         * comfortable minimum clearance.
         */}
        <div
          className="flex flex-col w-full h-full"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Panel Header */}
          <div className="w-full flex items-center justify-between min-h-[3.5rem] px-4 flex-shrink-0">
            <h2 className="font-semibold text-[1.25rem] leading-[1.875rem] text-[var(--grey-1000)]">
              Recents
            </h2>
            <button
              type="button"
              aria-label="Close recents"
              onClick={(e) => {
                e.stopPropagation();
                setIsRecentsOpen(false);
              }}
              className="w-9 h-9 flex items-center justify-center shrink-0 active:bg-[var(--grey-100)] rounded-full transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M13 1L1 13M1 1L13 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Scrollable Recents List */}
          <div className="flex-1 overflow-y-auto w-full">
            <ul className="flex flex-col py-3">
              {recentItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between min-h-[2.5rem] py-2 px-4 text-left active:bg-[var(--grey-100)] transition-colors duration-150 touch-manipulation"
                  >
                    <span className="font-normal text-sm leading-5 text-[var(--grey-1000)] truncate max-w-[75%]">
                      {item.title}
                    </span>
                    <span className="font-normal text-xs leading-[1.125rem] text-[var(--grey-500)] shrink-0 ml-2">
                      {item.time}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;