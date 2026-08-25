import React, { useEffect, useRef, useState } from "react";
import logoAsset from "../assets/logo.png";
import { Menu, Bell, Bot, ChevronDown, LogOut } from "lucide-react";
import FileOutputIcon from "./ui/FileOutputIcon";
import UserRoundCheckIcon from "./ui/UserRoundCheckIcon";
import MessageSquareTextIcon from "./ui/MessageSquareTextIcon";

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MAX_ATTACHMENTS = 10;

// â”€â”€ Current user (derived from the signed-in email â€” no display name is collected) â”€â”€
const deriveCurrentUser = (email: string) => {
  const local = email.split("@")[0] || "";
  const name =
    local
      .replace(/[._-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ") || "User";
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "U";
  return { name, email, initials };
};

// â”€â”€ Recents persistence (per signed-in user, survives sign-out/sign-in) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const recentsStorageKey = (email: string) => `synngular:recents:${email || "guest"}`;

const loadRecentItems = (email: string): RecentItem[] => {
  try {
    const raw = localStorage.getItem(recentsStorageKey(email));
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupt/unavailable storage falls back to the seeded demo list below.
  }
  return initialRecentItems;
};

// â”€â”€ Recents Dummy Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const initialRecentItems: RecentItem[] = [
  { id: 1,  title: "Contract analysis",                  time: "2m ago" },
  { id: 2,  title: "Customer Support Ticket Summary...", time: "2m ago" },
  { id: 3,  title: "HR Candidate Screening",             time: "2m ago" },
  { id: 4,  title: "Sales Lead Analysis",                time: "2m ago" },
  { id: 5,  title: "Invoice Processing",                 time: "2m ago" },
  { id: 6,  title: "Marketing Campaign Ideas",           time: "2m ago" },
  { id: 7,  title: "Employee Onboarding Workflow",       time: "2m ago" },
  { id: 8,  title: "Quarterly Sales Report",             time: "2m ago" },
  { id: 9,  title: "Vendor Comparison",                  time: "2m ago" },
  { id: 10, title: "Expense Report Review",              time: "2m ago" },
  { id: 11, title: "Product Requirements Draft",         time: "2m ago" },
  { id: 12, title: "Project Status Update",              time: "2m ago" },
  { id: 13, title: "Lead Qualification",                 time: "2m ago" },
  { id: 14, title: "Policy Document Summary",            time: "2m ago" },
  { id: 15, title: "Recruitment Pipeline Review",        time: "2m ago" },
  { id: 16, title: "Q3 Financial Review",                time: "2m ago" },
  { id: 17, title: "New Hire Onboarding Doc",            time: "2m ago" },
  { id: 18, title: "Sales Pitch Transcript",             time: "2m ago" },
  { id: 19, title: "Client Feedback Analysis",           time: "2m ago" },
  { id: 20, title: "Weekly Sync Notes",                  time: "2m ago" },
];

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Screen =
  | "signin" | "verify" | "terms" | "privacy"
  | "home" | "agents" | "outputs" | "approvals" | "notifications";

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  isKeyboardOpen: boolean;
  userEmail: string;
}

interface RecentItem {
  id: number;
  title: string;
  time: string;
}

interface Attachment {
  url: string;
  loading: boolean;
  name: string;
  isImage: boolean;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  files?: { url: string; type: string; name: string }[];
}

// â”€â”€ ChatInput â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ChatInputProps {
  message: string;
  attachments: Attachment[];
  isMultiline: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSend: () => void;
  onAttachClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  attachments,
  isMultiline,
  textareaRef,
  fileInputRef,
  onInput,
  onFocus,
  onBlur,
  onSend,
  onAttachClick,
  onFileChange,
  onRemoveAttachment,
}) => {
  const hasContent = message.trim().length > 0 || attachments.length > 0;

  // Attach and send buttons are shared between the single-row and stacked layouts.
  const attachButton = (
    <button
      onClick={onAttachClick}
      disabled={attachments.length >= MAX_ATTACHMENTS}
      aria-label="Attach file"
      className={`shrink-0 flex items-center justify-center rounded-full p-1 sm:p-0.5 transition-colors touch-manipulation ${
        attachments.length >= MAX_ATTACHMENTS
          ? "text-gray-300 cursor-not-allowed"
          : "text-gray-500 active:bg-gray-100 hover:bg-gray-100"
      }`}
    >
      <svg
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        className="w-5 h-5 sm:w-6 sm:h-6"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );

  const sendButton = (
    <button
      onClick={onSend}
      aria-label="Send message"
      className={`shrink-0 flex items-center justify-center rounded-full p-2 sm:p-2.5 transition-all touch-manipulation text-white bg-[var(--send-button-color)] ${
        hasContent ? "opacity-100 hover:opacity-90 shadow-sm cursor-pointer" : "opacity-40 cursor-default"
      }`}
    >
      <svg
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        className="w-4 h-4 sm:w-5 sm:h-5"
      >
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>
  );

  // In stacked mode the wrapping row is a flex item (flex:1, min-height:0) inside the
  // max-height-capped card, so it — not a hardcoded height guess — clips/scrolls the
  // textarea once the toolbar row below has taken its own (Hug-sized) share of the space.
  const textarea = (
    <textarea
      ref={textareaRef}
      value={message}
      onChange={onInput}
      onFocus={onFocus}
      onBlur={onBlur}
      rows={1}
      placeholder="Type a message here..."
      className="w-full bg-transparent resize-none focus:outline-none placeholder:text-gray-400 text-gray-900 text-sm sm:text-base"
    />
  );

  return (
    <div className="w-full p-2 sm:p-3 flex-shrink-0 relative z-20">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,application/pdf"
        multiple
        onChange={onFileChange}
      />

      <div
        className="w-full bg-white rounded-xl flex flex-col overflow-hidden"
        style={{
          "--chat-box-padding": "1rem",
          "--chat-toolbar-padding-x": "0.75rem",
          "--chat-max-height": "12.125rem",
          "--chat-shadow-color": "var(--grey-300)",
          "--send-button-color": "#643388",
          // maxHeight: "var(--chat-max-height)",
          boxShadow: "0 0.0625rem 0.25rem 0 var(--chat-shadow-color)",
        } as React.CSSProperties}
      >
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex flex-row overflow-x-auto gap-2 snap-x hide-scrollbar">
            {attachments.map((att, idx) => (
              <div
                key={att.url}
                className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 snap-start"
              >
                {att.isImage ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-full h-full object-cover rounded-xl border border-gray-200"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center p-1">
                    <span className="text-base sm:text-lg leading-none">ðŸ“„</span>
                    <span className="text-[0.55rem] sm:text-xs text-gray-600 truncate w-full text-center mt-0.5 leading-tight">
                      {att.name}
                    </span>
                  </div>
                )}
                {att.loading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                    <svg
                      className="animate-spin text-white w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
                <button
                  onClick={() => onRemoveAttachment(idx)}
                  aria-label={`Remove ${att.name}`}
                  className="absolute -top-1.5 -right-1.5 bg-gray-900/70 text-white rounded-full flex items-center justify-center touch-manipulation z-10 w-5 h-5 sm:w-6 sm:h-6 hover:bg-gray-900 transition-colors"
                >
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {attachments.length >= MAX_ATTACHMENTS && (
              <span className="text-xs text-gray-500 self-end pb-1 whitespace-nowrap pl-1">
                Max limit reached
              </span>
            )}
          </div>
        )}

        {isMultiline ? (
          /* ── Stacked layout: textarea on top, + / send row below ── */
          <div className="flex flex-col w-full " style={{ flex: "1 1 auto" }}>
            <div
              className="w-full overflow-y-auto min-h-0"
              style={{ padding: "var(--chat-box-padding)", paddingBottom: "0.375rem", flex: "1 1 auto" }}
            >
              {textarea}
            </div>
            {/* Toolbar: own horizontal padding, no vertical padding — hugs its buttons' height */}
            <div
              className="flex items-center justify-between w-full gap-1 sm:gap-2 flex-shrink-0"
              style={{ padding: "0 var(--chat-toolbar-padding-x)" }}
            >
              {attachButton}
              {sendButton}
            </div>
          </div>
        ) : (
          /* ── Single row (Toolbar): + button · textarea · send button ── */
          <div
            className="flex items-center gap-1 sm:gap-2 w-full"
            style={{ padding: "0.5rem" }}
          >
            {attachButton}
            {textarea}
            {sendButton}
          </div>
        )}
      </div>
    </div>
  );
};

// â”€â”€ Main HomeScreen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, isKeyboardOpen, userEmail }) => {
  const [message, setMessage]               = useState("");
  const [attachments, setAttachments]       = useState<Attachment[]>([]);
  const [isSoftKeyboard, setIsSoftKeyboard] = useState(false);
  const [isRecentsOpen, setIsRecentsOpen]   = useState(false);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [isMultiline, setIsMultiline]       = useState(false);
  const [recentItems, setRecentItems]       = useState<RecentItem[]>(() => loadRecentItems(userEmail));
  const [isLogoutOpen, setIsLogoutOpen]     = useState(false);

  const currentUser = deriveCurrentUser(userEmail);

  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const fileUrlsRef    = useRef<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Re-measures the textarea after every change and flips the input between its
  // single-row and stacked layouts once the content grows past one line. The
  // textarea's own max-height (set in ChatInput via CSS var calc) caps growth
  // beyond that, at which point it scrolls internally instead of the box growing.
  const syncTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || "0") || el.scrollHeight;
    setIsMultiline(el.scrollHeight > lineHeight + 2);
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const urls = fileUrlsRef.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  // Persists Recents under the signed-in user's key so it's restored on the next
  // sign-in (HomeScreen unmounts entirely on sign-out, so component state alone
  // wouldn't survive that round trip).
  useEffect(() => {
    try {
      localStorage.setItem(recentsStorageKey(userEmail), JSON.stringify(recentItems));
    } catch {
      // Storage unavailable (e.g. private browsing) — recents just won't persist.
    }
  }, [recentItems, userEmail]);

  useEffect(() => {
    if (!window.visualViewport) return;
    const onResize = () =>
      setIsSoftKeyboard(window.visualViewport!.height < window.innerHeight * 0.85);
    window.visualViewport.addEventListener("resize", onResize);
    onResize();
    return () => window.visualViewport!.removeEventListener("resize", onResize);
  }, []);

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    const fileData = attachments.map((a) => ({
      url:  a.url,
      type: a.isImage ? "image/jpeg" : "application/pdf",
      name: a.name,
    }));
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: message.trim(), isUser: true, files: fileData },
    ]);
    setMessage("");
    setAttachments([]);
    setIsMultiline(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    syncTextareaHeight();
  };

  const handleFocus = () => {
    setTimeout(syncTextareaHeight, 50);
  };

  const handleBlur = () => {};

  const handleAttachClick = () => {
    if (attachments.length >= MAX_ATTACHMENTS) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const toAdd = files.slice(0, MAX_ATTACHMENTS - attachments.length);
    const newArr: Attachment[] = toAdd.map((file) => {
      const url = URL.createObjectURL(file);
      fileUrlsRef.current.push(url);
      return { url, loading: true, name: file.name, isImage: file.type.startsWith("image/") };
    });
    setAttachments((prev) => [...prev, ...newArr]);
    newArr.forEach((att, i) =>
      setTimeout(() =>
        setAttachments((prev) =>
          prev.map((a) => (a.url === att.url ? { ...a, loading: false } : a))
        ), 1200 + i * 200
      )
    );
    e.target.value = "";
  };

  const handleRemoveAttachment = (index: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  // Archives the active conversation into Recents (if it has any messages), then
  // resets the chat back to its empty/welcome state.
  const handleNewChat = () => {
    if (messages.length > 0) {
      const firstUserMessage = messages.find((m) => m.isUser && m.text.trim());
      const title = firstUserMessage?.text.trim().slice(0, 60) || "New chat";
      setRecentItems((prev) => [{ id: Date.now(), title, time: "Just now" }, ...prev]);
    }
    setMessages([]);
    setMessage("");
    setAttachments([]);
    setIsMultiline(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsRecentsOpen(false);
  };

  // â”€â”€ Derived state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const navHidden = isKeyboardOpen || isSoftKeyboard;

  const inputWrapperPb = navHidden
    ? "max(var(--safe-bottom), 0.5rem)"
    : "calc(var(--nav-height, 3.5rem) + max(var(--safe-bottom), 0.75rem) + 0.75rem)";

  const chatInputProps: ChatInputProps = {
    message,
    attachments,
    isMultiline,
    textareaRef,
    fileInputRef,
    onInput:            handleInput,
    onFocus:            handleFocus,
    onBlur:             handleBlur,
    onSend:             handleSend,
    onAttachClick:      handleAttachClick,
    onFileChange:       handleFileChange,
    onRemoveAttachment: handleRemoveAttachment,
  };

  // â”€â”€ Nav items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const navItems = [
    {
      key: "home" as Screen,
      label: "Chat",
      icon: (active: boolean) => (
        <MessageSquareTextIcon
          size={24}
          style={{ color: active ? "var(--purple-1000)" : "var(--grey-500)" }}
        />
      ),
    },
    {
      key: "agents" as Screen,
      label: "Agent",
      icon: (active: boolean) => (
        <Bot
          size={24} strokeWidth={1.5}
          style={{ color: active ? "var(--purple-1000)" : "var(--grey-500)" }}
        />
      ),
    },
    {
      key: "outputs" as Screen,
      label: "Outputs",
      icon: (active: boolean) => (
        <FileOutputIcon
          size={24}
          style={{ color: active ? "var(--purple-1000)" : "var(--grey-500)" }}
        />
      ),
    },
    {
      key: "approvals" as Screen,
      label: "Approvals",
      icon: (active: boolean) => (
        <UserRoundCheckIcon
          size={24}
          style={{ color: active ? "var(--purple-1000)" : "var(--grey-500)" }}
        />
      ),
    },
  ] as const;

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div
      className="flex flex-col bg-[var(--background)] p-2 overflow-hidden"
      style={{
        height:        "100dvh",
        paddingTop:    "max(var(--safe-top), 2.75rem)",
        paddingBottom: "max(var(--safe-bottom), 0.75rem)",
      }}
    >
      {/* â”€â”€ Header â”€â”€ */}
      <header className="relative z-30 w-full flex items-center justify-between flex-shrink-0 bg-[var(--background)] px-6 py-4">
        <button
          type="button"
          aria-label="Open menu"
          onClick={(e) => { e.stopPropagation(); setIsRecentsOpen(true); }}
          className="flex items-center justify-center rounded-xl text-[var(--foreground)] hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)] touch-manipulation"
          style={{ width: "2.5rem", height: "2.5rem" }}
        >
          <Menu className="w-6 h-6" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          onClick={(e) => { e.stopPropagation(); onNavigate("notifications"); }}
          className="flex items-center justify-center rounded-xl text-[var(--foreground)] hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)] touch-manipulation"
          style={{ width: "2.5rem", height: "2.5rem" }}
        >
          <Bell className="w-6 h-6" />
        </button>
      </header>

      {/* â”€â”€ Body â”€â”€ */}
      {messages.length === 0 ? (
        /* â”€â”€ Welcome / empty state â”€â”€ */
        <div className="flex flex-col flex-1 min-h-0">
          {/* Centred welcome content â€” flex-1 so it fills all space above the input */}
          <main className="flex-1 flex flex-col items-center justify-center w-full px-4 min-h-0">
            <img
              src={logoAsset}
              alt="Logo"
              className="object-contain mx-auto mb-4"
              style={{
                width:       "clamp(4rem, 12vw, 6.25rem)",
                aspectRatio: "1 / 1",
              }}
            />
            <h1
              className="font-semibold text-center mb-1"
              style={{
                fontSize:   "clamp(1.5rem, 5vw, 1.875rem)",
                lineHeight: 1.5,
                color:      "var(--grey-1000)",
              }}
            >
              Welcome back
            </h1>
            <p
              className="font-medium text-center"
              style={{
                fontSize:   "clamp(0.875rem, 3.5vw, 1rem)",
                lineHeight: 1.5,
                color:      "var(--grey-700)",
              }}
            >
              What do you want to achieve, today?
            </p>
          </main>

          {/* Input anchored to bottom, sitting just above the nav */}
          <div
            className="w-full flex-shrink-0 bg-[var(--background)]"
            style={{ paddingBottom: inputWrapperPb, paddingTop: "0.5rem" }}
          >
            <ChatInput {...chatInputProps} />
          </div>
        </div>
      ) : (
        /* â”€â”€ Active chat â”€â”€ */
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div
            className="flex-1 overflow-y-auto w-full flex flex-col gap-3"
            style={{ padding: "1rem 1rem 0.5rem" }}
          >
            {messages.map((msg) => (
              <div key={msg.id} className="flex w-full justify-end">
                <div
                  className="bg-[#F4F4F6] text-[var(--grey-900)] rounded-[1.125rem]"
                  style={{ maxWidth: "82%", padding: "0.625rem 0.75rem" }}
                >
                  {msg.text ? (
                    <p
                      className="break-words whitespace-pre-wrap font-normal"
                      style={{ fontSize: "0.875rem", lineHeight: "1.375rem" }}
                    >
                      {msg.text}
                    </p>
                  ) : null}

                  {msg.files && msg.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.files.map((file, i) =>
                        file.type.startsWith("image/") ? (
                          <img
                            key={`${file.name}-${i}`}
                            src={file.url}
                            alt={file.name}
                            className="rounded-xl object-cover border border-[var(--grey-200)]"
                            style={{ width: "clamp(3rem, 14vw, 4rem)", height: "clamp(3rem, 14vw, 4rem)" }}
                          />
                        ) : (
                          <div
                            key={`${file.name}-${i}`}
                            className="rounded-xl bg-[var(--grey-100)] flex flex-col items-center justify-center p-1"
                            style={{ width: "clamp(3rem, 14vw, 4rem)", height: "clamp(3rem, 14vw, 4rem)" }}
                          >
                            <span>ðŸ“„</span>
                            <span
                              className="text-center truncate w-full text-[var(--grey-700)]"
                              style={{ fontSize: "0.5rem", marginTop: "0.125rem" }}
                            >
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
            <div ref={messagesEndRef} />
          </div>

          <div
            className="w-full flex-shrink-0 bg-[var(--background)]"
            style={{ paddingBottom: inputWrapperPb, paddingTop: "0.5rem" }}
          >
            <ChatInput {...chatInputProps} />
          </div>
        </div>
      )}

      {/* â”€â”€ Bottom Nav â”€â”€ */}
      <nav
        className={`fixed bottom-0 left-0 w-full bg-white border-t border-[var(--grey-200)] z-40 flex transition-transform duration-200 ${
          navHidden
            ? "translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100"
        }`}
        style={{
          padding:       "0.75rem 0.75rem 0",
          paddingBottom: "max(var(--safe-bottom), 0.75rem)",
          gap:           "0.75rem",
        }}
      >
        {navItems.map(({ key, label, icon }) => {
          const active = key === "home";
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className="flex-1 flex flex-col items-center justify-between relative touch-manipulation"
              style={{ height: "2.75rem" }}
            >
              {active && (
                <div
                  className="absolute left-0 w-full bg-[var(--purple-1000)] rounded-b-sm"
                  style={{ top: "-0.75rem", height: "0.125rem" }}
                />
              )}
              <div className="flex items-center justify-center" style={{ width: "1.5rem", height: "1.5rem" }}>
                {icon(active)}
              </div>
              <span
                className="font-medium"
                style={{
                  fontSize:   "0.625rem",
                  lineHeight: "0.75rem",
                  color:      active ? "var(--purple-1000)" : "var(--grey-500)",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* â”€â”€ Backdrop â”€â”€ */}
      <div
        className={`fixed inset-0 z-40 bg-[var(--grey-500)] transition-opacity duration-300 ${
          isRecentsOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsRecentsOpen(false)}
      />

      {/* â”€â”€ Recents Side Panel â”€â”€ */}
      <div
        aria-modal="true"
        role="dialog"
        aria-label="Recents"
        className={`fixed top-0 left-0 z-50 h-[100dvh] bg-white transition-transform duration-300 ease-in-out ${
          isRecentsOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "min(calc(100vw - 3.5rem), 20rem)" }}
      >
        <div
          className="flex flex-col w-full h-full"
          style={{
            paddingTop:    "max(var(--safe-top), 2.75rem)",
            paddingBottom: "max(var(--safe-bottom), 0.75rem)",
          }}
        >
          <div
            className="w-full flex items-center justify-between flex-shrink-0 px-4"
            style={{ minHeight: "3.5rem" }}
          >
            <h2
              className="font-semibold text-[var(--grey-1000)]"
              style={{ fontSize: "1.25rem", lineHeight: "1.875rem" }}
            >
              Recents
            </h2>
            <button
              type="button"
              aria-label="Close recents"
              onClick={() => setIsRecentsOpen(false)}
              className="flex items-center justify-center rounded-full active:bg-[var(--grey-100)] transition-colors"
              style={{ width: "2.25rem", height: "2.25rem" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M13 1L1 13M1 1L13 13"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto w-full">
            <ul className="flex flex-col py-3">
              {recentItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-left active:bg-[var(--grey-100)] transition-colors touch-manipulation px-4 py-2"
                    style={{ minHeight: "2.5rem" }}
                  >
                    <span
                      className="font-normal text-[var(--grey-1000)] truncate"
                      style={{ fontSize: "0.875rem", lineHeight: "1.25rem", maxWidth: "75%" }}
                    >
                      {item.title}
                    </span>
                    <span
                      className="font-normal text-[var(--grey-500)] shrink-0 ml-2"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {item.time}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* â”€â”€ User footer â”€â”€ */}
          <div className="flex-shrink-0 border-t border-[var(--grey-200)] px-4 py-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              aria-label="Account menu"
              className="flex items-center gap-2 min-w-0 text-left rounded-lg active:bg-[var(--grey-100)] transition-colors touch-manipulation p-1 -m-1"
            >
              <div
                className="rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold shrink-0"
                style={{ width: "2rem", height: "2rem", fontSize: "0.75rem" }}
              >
                {currentUser.initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span
                    className="font-medium text-[var(--grey-1000)] truncate"
                    style={{ fontSize: "0.8125rem", lineHeight: "1.125rem" }}
                  >
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--grey-500)] shrink-0" />
                </div>
                <span
                  className="text-[var(--grey-500)] truncate block"
                  style={{ fontSize: "0.6875rem", lineHeight: "1rem" }}
                >
                  {currentUser.email}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleNewChat}
              className="shrink-0 rounded-full border border-[var(--grey-300)] text-[var(--grey-1000)] font-medium active:bg-[var(--grey-100)] transition-colors touch-manipulation"
              style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
            >
              New chat
            </button>
          </div>
        </div>
      </div>

      {/* â”€â”€ Logout backdrop â”€â”€ */}
      <div
        className={`fixed inset-0 z-[60] bg-[var(--grey-900)] transition-opacity duration-300 ${
          isLogoutOpen ? "opacity-70 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsLogoutOpen(false)}
      />

      {/* â”€â”€ Logout bottom sheet â”€â”€ */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Account menu"
        className={`fixed bottom-0 left-0 w-full z-[70] bg-white rounded-t-2xl transition-transform duration-300 ease-in-out ${
          isLogoutOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "max(var(--safe-bottom), 0.75rem)" }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="rounded-full bg-[var(--grey-300)]" style={{ width: "2.25rem", height: "0.25rem" }} />
        </div>
        <button
          type="button"
          onClick={() => {
            setIsLogoutOpen(false);
            setIsRecentsOpen(false);
            onNavigate("signin");
          }}
          className="w-full flex items-center justify-between px-4 py-4 active:bg-[var(--grey-100)] transition-colors touch-manipulation"
        >
          <span className="font-medium text-red-600" style={{ fontSize: "0.9375rem" }}>
            Logout
          </span>
          <LogOut className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;