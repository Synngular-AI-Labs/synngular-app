import React, { useEffect, useRef, useState } from "react";
import logoAsset from "../assets/logo.png";
import { M3 } from "tauri-plugin-m3";
import {
  Menu,
  Bell,
  Paperclip,
  Send,
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    if (!message.trim() && selectedFiles.length === 0) return;

    const fileData = selectedFiles.map((file) => {
      const url = URL.createObjectURL(file);
      fileUrlsRef.current.push(url);
      return { url, type: file.type, name: file.name };
    });

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
    setSelectedFiles([]);
  };

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

          <div className="w-full mt-auto flex-shrink-0">
            <InputArea
              message={message}
              setMessage={setMessage}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              fileInputRef={fileInputRef}
              handleSend={handleSend}
              setIsTyping={setIsTyping}
            />
          </div>
        </div>
      ) : (
        // â”€â”€ Active chat state â”€â”€
        <div className="flex flex-col flex-1 w-full min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto w-full px-6 py-4 pb-[calc(4rem+max(env(safe-area-inset-bottom),1.25rem))] flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="self-end max-w-[85%] rounded-2xl px-4 py-3"
                style={{ background: "var(--purple-1000)" }}
              >
                {msg.files && msg.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.files.map((file, index) =>
                      file.type.startsWith("image/") ? (
                        <img
                          key={`${file.name}-${index}`}
                          src={file.url}
                          alt={file.name}
                          className="w-16 h-16 rounded object-cover border"
                          style={{ borderColor: "var(--grey-100)" }}
                        />
                      ) : (
                        <div
                          key={`${file.name}-${index}`}
                          className="w-16 h-16 rounded bg-[var(--card)] flex flex-col items-center justify-center truncate p-1 text-[var(--foreground)]"
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
                <span className="text-sm" style={{ color: "var(--background)" }}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-shrink-0">
            <InputArea
              message={message}
              setMessage={setMessage}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              fileInputRef={fileInputRef}
              handleSend={handleSend}
              setIsTyping={setIsTyping}
            />
          </div>
        </div>
      )}

      {/* â”€â”€ Bottom Nav â”€â”€ */}
      {!isTyping && (
        <nav className={`fixed bottom-0 left-0 w-full bg-white border-t border-[var(--grey-200)] z-40 pt-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] px-6 flex justify-between items-center transition-transform duration-200 ${isKeyboardOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
          {/* Active: Chat */}
          <div className="relative flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer">
            <div className="absolute top-0 inset-x-0 h-px bg-[var(--purple-1000)]" />
            <MessageSquareTextIcon
              size={24}
              style={{ color: "var(--purple-1000)" }}
            />
            <span className="text-xs font-medium text-[var(--purple-1000)]">
              Chat
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("agents")}
            className="flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer transition-colors"
          >
            <Bot
              size={24}
              strokeWidth={1.5}
              style={{ color: "var(--grey-700)" }}
            />
            <span className="text-xs font-medium text-[var(--grey-700)]">
              Agent
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("outputs")}
            className="flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer transition-colors"
          >
            <FileOutputIcon size={24} style={{ color: "var(--grey-700)" }} />
            <span className="text-xs font-medium text-[var(--grey-700)]">
              Outputs
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("approvals")}
            className="flex-1 flex flex-col items-center pt-3 pb-1 cursor-pointer transition-colors"
          >
            <UserRoundCheckIcon size={24} style={{ color: "var(--grey-700)" }} />
            <span className="text-xs font-medium text-[var(--grey-700)]">
              Approvals
            </span>
          </button>
        </nav>
      )}

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

// â”€â”€ InputArea â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface InputAreaProps {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  handleSend: () => void;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
}

const InputArea: React.FC<InputAreaProps> = ({
  message,
  setMessage,
  selectedFiles,
  setSelectedFiles,
  fileInputRef,
  handleSend,
  setIsTyping,
}) => (
  <div className="w-full px-4 py-3 bg-[var(--background)] border-t border-[var(--grey-100)]">
    {/* Hidden native file picker */}
    <input
      type="file"
      ref={fileInputRef}
      className="hidden"
      multiple
      onChange={(e) => {
        if (e.target.files) {
          setSelectedFiles(Array.from(e.target.files).slice(0, 10));
        }
      }}
    />

    {/* Staged file previews */}
    {selectedFiles.length > 0 && (
      <div className="flex flex-row gap-2 overflow-x-auto pb-2">
        {selectedFiles.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="relative w-10 h-10 rounded bg-[var(--grey-100)] flex items-center justify-center p-1 flex-shrink-0"
          >
            <span className="text-[10px] text-[var(--foreground)] text-center truncate">
              {file.name}
            </span>
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--grey-500)] text-white flex items-center justify-center text-[10px] leading-none"
              onClick={() =>
                setSelectedFiles((current) =>
                  current.filter((_, i) => i !== index)
                )
              }
            >
              Ã—
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[10px] font-bold self-center flex-shrink-0"
          style={{ color: "var(--foreground)" }}
          onClick={() => setSelectedFiles([])}
        >
          Clear
        </button>
      </div>
    )}

    {/* Compose box */}
    <div className="w-full mb-1">
      <div className="w-full min-h-24 border border-[var(--grey-300)] rounded-2xl bg-white flex flex-col justify-between p-3 shadow-sm">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsTyping(true)}
          onBlur={() => setIsTyping(false)}
          placeholder="Type a message..."
          rows={3}
          className="w-full flex-1 bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--grey-500)] resize-none"
        />

        <div className="flex flex-row items-center justify-end gap-2 w-full mt-2">
          <button
            type="button"
            aria-label="Attach file"
            className="p-1.5 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            onClick={() => fileInputRef?.current?.click()}
          >
            <Paperclip className="w-5 h-5 text-[var(--grey-700)]" />
          </button>

          <button
            type="button"
            aria-label="Send message"
            className="p-1.5 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            onClick={() => {
              if (message.trim().length > 0) handleSend();
            }}
          >
            <Send
              className={`w-5 h-5 transition-colors duration-200 ${
                message.trim().length > 0
                  ? "text-[var(--purple-1000)]"
                  : "text-[var(--grey-500)]"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default HomeScreen;