import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import logoAsset from "../assets/logo.png";
import { Menu, Bell, /* Bot, */ ChevronDown, LogOut, Sparkle, Folder, LayoutGrid, Loader2 } from "lucide-react";
import FileOutputIcon from "./ui/FileOutputIcon";
/* import UserRoundCheckIcon from "./ui/UserRoundCheckIcon"; */
import MessageSquareTextIcon from "./ui/MessageSquareTextIcon";
import ProjectPickerSheet, { getProjectIcon, type Project } from "./ProjectPickerSheet";
import { getChatSessionMessages, listChatSessions, type ChatSessionSummary } from "../lib/api/chat";
import { getOrganizationAccess, listOrganizations, type Organization } from "../lib/api/organization";
import {
  type ChatMessage,
  type ChatFile,
  type PendingQuestion,
  type PendingAction,
  type QuestionResponse,
  type ActionResult,
  type ActionRoute,
} from "../lib/chat/useSocketChat";

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
// â”€â”€ Recents Dummy Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Screen =
  | "signin" | "verify" | "terms" | "privacy"
  | "home" | "agents" | "outputs" | "approvals" | "notifications";

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  isKeyboardOpen: boolean;
  userEmail: string;
  organizationId: string | null;
  userId: string | null;
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onSelectOrganization: (organization: Organization) => Promise<void>;
  // Chat state/actions, owned by App (see App.tsx) so they survive HomeScreen
  // unmounting when the user navigates to another tab and back.
  messages: ChatMessage[];
  isConnected: boolean;
  isSending: boolean;
  connectionError: string | null;
  sendMessage: (text: string, files?: ChatFile[]) => boolean;
  answerQuestion: (toolCallId: string, responses: QuestionResponse[]) => void;
  resolveAction: (actionId: string, result: ActionResult, route: ActionRoute) => void;
  startNewChat: () => void;
  loadMessages: (restored: ChatMessage[]) => void;
}

interface RecentItem {
  id: string;
  title: string;
  time: string;
  group: string;
  session: ChatSessionSummary;
}

const relativeTime = (dateValue?: string | null): { time: string; group: string } => {
  if (!dateValue) return { time: "", group: "Earlier" };
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return { time: "", group: "Earlier" };
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  const time = minutes < 1 ? "Just now" : minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`;
  const group = minutes < 1440 ? "Today" : minutes < 2880 ? "Yesterday" : "Earlier";
  return { time, group };
};

interface Attachment {
  url: string;
  loading: boolean;
  name: string;
  isImage: boolean;
}

// â”€â”€ ChatInput â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ChatInputProps {
  message: string;
  attachments: Attachment[];
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSend: () => void;
  onAttachClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
  sendDisabled?: boolean;
  isSending?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  attachments,
  textareaRef,
  fileInputRef,
  onInput,
  onFocus,
  onBlur,
  onSend,
  onAttachClick,
  onFileChange,
  onRemoveAttachment,
  sendDisabled = false,
  isSending = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isStacked = isExpanded || attachments.length > 0;

  const hasContent =
    (message.trim().length > 0 || attachments.length > 0) && !sendDisabled;

  React.useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (!message) {
      setIsExpanded(false);
      textarea.style.height = "auto";
      return;
    }

    if (isExpanded) {
      textarea.style.height = `${textarea.scrollHeight}px`;
      return;
    }

    textarea.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
    const shouldExpand = Number.isFinite(lineHeight) && textarea.scrollHeight > lineHeight + 1;

    if (shouldExpand) {
      setIsExpanded(true);
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message, isExpanded, textareaRef]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInput(event);
  };

  const attachButton = (
    <button
      type="button"
      onClick={onAttachClick}
      disabled={attachments.length >= MAX_ATTACHMENTS}
      aria-label="Attach file"
      className="flex shrink-0 items-center justify-center rounded-full p-2 text-gray-500 touch-manipulation"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );

  const sendButton = (
    <button
      type="button"
      onClick={onSend}
      disabled={!hasContent || isSending}
      aria-label="Send message"
      className={`flex shrink-0 items-center justify-center rounded-full p-2 text-white bg-[var(--send-button-color)] touch-manipulation ${
        hasContent && !isSending ? "opacity-100" : "opacity-40 cursor-default"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>
  );

  const textarea = (
    <textarea
      ref={textareaRef}
      value={message}
      onChange={handleInput}
      onFocus={onFocus}
      onBlur={onBlur}
      rows={1}
      wrap="soft"
      placeholder="Type a message here..."
      className="
        block
        w-full
        min-w-0
        resize-none
        whitespace-pre-wrap
        break-all
        bg-transparent
        p-0
        text-sm
        leading-5
        text-gray-900
        outline-none
        placeholder:text-gray-400
        focus:outline-none
        focus:ring-0
      "
      style={{
        maxHeight: "35dvh",
        overflowY: isExpanded ? "auto" : "hidden",
        transition: "height 150ms ease-out",
      }}
    />
  );

  const attachmentPreview =
    attachments.length > 0 && (
      <div
        className="
          shrink-0
          flex
          items-start
          gap-2
          overflow-x-auto
          overscroll-x-contain
          px-3
          pt-3
          pb-2
          snap-x
          hide-scrollbar
        "
      >
        {attachments.map((att, idx) => (
          <div
            key={att.url}
            className="
              relative
              shrink-0
              snap-start
              w-[clamp(3.5rem,16vw,4.5rem)]
              aspect-square
            "
          >
            <div
              className="
                size-full
                overflow-hidden
                rounded-xl
                border
                border-gray-200
                bg-gray-50
              "
            >
              {att.isImage ? (
                <img
                  src={att.url}
                  alt={att.name}
                  className="size-full object-cover"
                />
              ) : (
                <div
                  className="
                    size-full
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-1
                    p-1
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="size-5 shrink-0 text-gray-500"
                  >
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    />
                    <path d="M14 2v6h6" />
                  </svg>

                  <span
                    className="
                      w-full
                      truncate
                      text-center
                      text-[0.6rem]
                      leading-tight
                      text-gray-600
                    "
                  >
                    {att.name}
                  </span>
                </div>
              )}
            </div>

            {att.loading && (
              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-black/40
                "
              >
                <svg
                  className="size-5 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}

            <button
              type="button"
              onClick={() => onRemoveAttachment(idx)}
              aria-label={`Remove ${att.name}`}
              className="
                absolute
                -right-1
                -top-1
                z-10
                flex
                size-5
                items-center
                justify-center
                rounded-full
                bg-gray-900/75
                text-white
                transition-colors
                hover:bg-gray-900
                touch-manipulation
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {attachments.length >= MAX_ATTACHMENTS && (
          <span
            className="
              shrink-0
              self-center
              whitespace-nowrap
              text-xs
              text-gray-500
            "
          >
            Max limit reached
          </span>
        )}
      </div>
    );

  return (
    <div className="relative z-20 w-full shrink-0 px-2">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,application/pdf"
        multiple
        onChange={onFileChange}
      />

      <div
        className="
          flex
          w-full
          max-h-[50dvh]
          flex-col
          overflow-hidden
          rounded-xl
          bg-white
        "
        style={
          {
            "--send-button-color": "#643388",
            boxShadow: "0 0.0625rem 0.25rem 0 var(--grey-300)",
          } as React.CSSProperties
        }
      >
        {/* Attachments always remain at the top */}
        {attachmentPreview}

        <div
          className={`flex min-h-0 w-full gap-1 px-[var(--spacing-4)] py-[var(--spacing-4)] ${
            isStacked ? "flex-col" : "items-center"
          } ${
            attachments.length > 0 ? "min-h-0 flex-1" : ""
          }`}
        >
          <div
            className={`min-w-0 ${
              attachments.length > 0
                ? "order-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-1"
                : isStacked
                ? "order-1 w-full max-h-[35dvh] shrink-0 overflow-y-auto overscroll-contain px-1 py-1"
                : "order-2 min-w-0 flex-1"
            }`}
          >
            {textarea}
          </div>

          <div
            className={
              isStacked
                ? "order-2 flex shrink-0 items-center justify-between gap-1"
                : "contents"
            }
          >
            <span className={isStacked ? "" : "order-1"}>{attachButton}</span>
            <span className={isStacked ? "" : "order-3"}>{sendButton}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── QuestionCard ── renders a paused chat.question and collects answers ────
const cardOptionButtonClass = (selected: boolean) =>
  `rounded-full border px-3 py-1.5 text-xs font-medium touch-manipulation transition-colors ${
    selected
      ? "bg-[var(--purple-1000)] border-[var(--purple-1000)] text-white"
      : "bg-white border-[var(--grey-300)] text-[var(--foreground)]"
  }`;

const QuestionCard: React.FC<{
  pending: PendingQuestion;
  onSubmit: (toolCallId: string, responses: QuestionResponse[]) => void;
}> = ({ pending, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});

  const setText = (i: number, value: string) => setAnswers((a) => ({ ...a, [i]: value }));
  const setSingle = (i: number, option: string) => setAnswers((a) => ({ ...a, [i]: option }));
  const toggleMulti = (i: number, option: string) =>
    setAnswers((a) => {
      const current = (a[i] as string[]) ?? [];
      return {
        ...a,
        [i]: current.includes(option) ? current.filter((o) => o !== option) : [...current, option],
      };
    });

  const canSubmit = pending.questions.every((_, i) => {
    const a = answers[i];
    if (a === undefined) return false;
    return Array.isArray(a) ? a.length > 0 : a.trim().length > 0;
  });

  const handleSubmit = () => {
    onSubmit(
      pending.toolCallId,
      pending.questions.map((q, i) => ({ question: q.question, answer: answers[i] ?? "" }))
    );
  };

  return (
    <div className="flex flex-col gap-3 mt-2 rounded-xl border border-[var(--grey-200)] bg-[var(--grey-50)] p-3">
      {pending.questions.map((q, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <span className="text-body-14-sb text-[var(--grey-1000)]">{q.question}</span>
          {q.answerType === "text" && (
            <input
              type="text"
              value={(answers[i] as string) ?? ""}
              onChange={(e) => setText(i, e.target.value)}
              placeholder="Type your answer..."
              className="w-full rounded-lg border border-[var(--grey-300)] px-3 py-2 text-sm outline-none focus:border-[var(--purple-1000)]"
            />
          )}
          {q.answerType === "single-choice" && (
            <div className="flex flex-wrap gap-2">
              {(q.options ?? []).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSingle(i, opt)}
                  className={cardOptionButtonClass(answers[i] === opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {q.answerType === "multi-choice" && (
            <div className="flex flex-wrap gap-2">
              {(q.options ?? []).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleMulti(i, opt)}
                  className={cardOptionButtonClass(((answers[i] as string[]) ?? []).includes(opt))}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`self-end rounded-full px-4 py-1.5 text-xs font-semibold touch-manipulation transition-opacity ${
          canSubmit ? "bg-[var(--purple-1000)] text-white" : "bg-[var(--grey-200)] text-[var(--grey-500)]"
        }`}
      >
        Submit
      </button>
    </div>
  );
};

// ── ActionCard ── renders a paused chat.action (approval/choice/form/etc) ──
const ActionCard: React.FC<{
  pending: PendingAction;
  onResolve: (actionId: string, result: ActionResult, route: ActionRoute) => void;
}> = ({ pending, onResolve }) => {
  const { action, actionId } = pending;
  const [selected, setSelected] = useState<string[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const isMultiChoice = action.actionType === "choice" && !!action.multiple;

  const toggleOption = (opt: string) => {
    if (isMultiChoice) {
      setSelected((s) => (s.includes(opt) ? s.filter((o) => o !== opt) : [...s, opt]));
    } else {
      setSelected([opt]);
    }
  };

  const resolve = (values?: Record<string, unknown>) =>
    onResolve(actionId, { status: "resolved", values }, action.route);
  const cancel = () => onResolve(actionId, { status: "cancelled" }, action.route);

  return (
    <div
      className={`flex flex-col gap-2 mt-2 rounded-xl border p-3 bg-[var(--grey-50)] ${
        action.destructive ? "border-[var(--error-600)]" : "border-[var(--grey-200)]"
      }`}
    >
      {action.title && <span className="text-body-14-sb text-[var(--grey-1000)]">{action.title}</span>}
      {action.prompt && <span className="text-secondary-14 text-[var(--grey-700)]">{action.prompt}</span>}

      {(action.actionType === "form" || action.actionType === "custom") && action.fields && (
        <div className="flex flex-col gap-2 mt-1">
          {action.fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <span className="text-xs font-medium text-[var(--grey-700)]">
                {field.label}
                {field.required ? " *" : ""}
              </span>
              {field.type === "select" ? (
                <select
                  value={fieldValues[field.key] ?? ""}
                  onChange={(e) => setFieldValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  className="rounded-lg border border-[var(--grey-300)] px-3 py-2 text-sm bg-white"
                >
                  <option value="" disabled>
                    Select...
                  </option>
                  {(field.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  value={fieldValues[field.key] ?? ""}
                  onChange={(e) => setFieldValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  className="rounded-lg border border-[var(--grey-300)] px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => resolve(fieldValues)}
            className="self-end rounded-full bg-[var(--purple-1000)] text-white px-4 py-1.5 text-xs font-semibold mt-1 touch-manipulation"
          >
            Submit
          </button>
        </div>
      )}

      {action.actionType === "choice" && (
        <>
          <div className="flex flex-wrap gap-2 mt-1">
            {(action.options ?? []).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleOption(opt)}
                className={cardOptionButtonClass(selected.includes(opt))}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => resolve({ selected: isMultiChoice ? selected : selected[0] })}
            disabled={selected.length === 0}
            className={`self-end rounded-full px-4 py-1.5 text-xs font-semibold mt-1 touch-manipulation ${
              selected.length > 0
                ? "bg-[var(--purple-1000)] text-white"
                : "bg-[var(--grey-200)] text-[var(--grey-500)]"
            }`}
          >
            Submit
          </button>
        </>
      )}

      {(action.actionType === "approval" || action.actionType === "yes_no" || action.actionType === "confirm") && (
        <div className="flex gap-2 mt-1 justify-end">
          <button
            type="button"
            onClick={cancel}
            className="rounded-full border border-[var(--grey-300)] text-[var(--foreground)] px-4 py-1.5 text-xs font-semibold touch-manipulation"
          >
            {action.options?.[1] ?? "No"}
          </button>
          <button
            type="button"
            onClick={() => resolve({ answer: action.options?.[0] ?? "Yes" })}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold text-white touch-manipulation ${
              action.destructive ? "bg-[var(--error-600)]" : "bg-[var(--purple-1000)]"
            }`}
          >
            {action.options?.[0] ?? "Yes"}
          </button>
        </div>
      )}

      {action.actionType === "acknowledge" && (
        <button
          type="button"
          onClick={() => resolve({ answer: "OK" })}
          className="self-end rounded-full bg-[var(--purple-1000)] text-white px-4 py-1.5 text-xs font-semibold mt-1 touch-manipulation"
        >
          OK
        </button>
      )}
    </div>
  );
};
// â”€â”€ Main HomeScreen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  isKeyboardOpen,
  userEmail,
  organizationId,
  selectedProject,
  onSelectProject,
  onSelectOrganization,
  messages,
  isConnected,
  isSending,
  connectionError,
  sendMessage,
  answerQuestion,
  resolveAction,
  startNewChat,
  loadMessages,
}) => {
  const [message, setMessage]               = useState("");
  const [attachments, setAttachments]       = useState<Attachment[]>([]);
  const [isSoftKeyboard, setIsSoftKeyboard] = useState(false);
  const [isRecentsOpen, setIsRecentsOpen]   = useState(false);
  const [recentItems, setRecentItems]       = useState<RecentItem[]>([]);
  const [isLoadingRecents, setIsLoadingRecents] = useState(false);
  const [recentsError, setRecentsError]     = useState<string | null>(null);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [isLogoutOpen, setIsLogoutOpen]     = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [organizationError, setOrganizationError] = useState<string | null>(null);
  const [switchingOrganizationId, setSwitchingOrganizationId] = useState<string | null>(null);
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);

  const currentUser = deriveCurrentUser(userEmail);

  useEffect(() => {
    if (!isLogoutOpen) return;
    let cancelled = false;
    setIsLoadingOrganizations(true);
    setOrganizationError(null);
    listOrganizations()
      .then((items) => {
        if (!cancelled) setOrganizations(items);
      })
      .catch(() => {
        if (!cancelled) setOrganizationError("Unable to load organizations.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOrganizations(false);
      });
    return () => { cancelled = true; };
  }, [isLogoutOpen]);

  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const fileUrlsRef    = useRef<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const urls = fileUrlsRef.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  useEffect(() => {
    const projectId = selectedProject?.id;
    if (!projectId) {
      setRecentItems([]);
      return;
    }
    let cancelled = false;
    setIsLoadingRecents(true);
    setRecentsError(null);
    listChatSessions(projectId)
      .then((sessions) => {
        if (cancelled) return;
        setRecentItems(sessions.map((session) => {
          const timing = relativeTime(session.updatedAt ?? session.createdAt);
          return {
            id: session.id,
            title: session.title?.trim() || session.firstMessage?.trim() || "New chat",
            time: timing.time,
            group: timing.group,
            session,
          };
        }));
      })
      .catch(() => {
        if (!cancelled) setRecentsError("Unable to load recent chats.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRecents(false);
      });
    return () => { cancelled = true; };
  }, [selectedProject?.id, isRecentsOpen]);

  // Tracks the browser/webview's *actual* visible height so the screen's own
  // height can be pinned to it directly. `100dvh` alone is unreliable once the
  // on-screen keyboard opens on some Android WebViews — the layout viewport
  // doesn't shrink to match, so the screen ends up taller than what's visible
  // and the page becomes scrollable underneath the keyboard. Reading the real
  // number from visualViewport avoids that regardless of device/keyboard size.
  useEffect(() => {
    if (!window.visualViewport) return;
    const onResize = () => {
      setIsSoftKeyboard((wasOpen) => {
        const isOpen = window.visualViewport!.height < window.innerHeight * 0.85;
        return wasOpen === isOpen ? wasOpen : isOpen;
      });
    };
    window.visualViewport.addEventListener("resize", onResize);
    onResize();
    return () => window.visualViewport!.removeEventListener("resize", onResize);
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    // Attachments are shown in the sent bubble for local preview only — the
    // chat.message protocol has no file field, so they're never transmitted.
    const fileData: ChatFile[] = attachments.map((a) => ({
      url:  a.url,
      type: a.isImage ? "image/jpeg" : "application/pdf",
      name: a.name,
    }));
    const sent = sendMessage(message, fileData.length > 0 ? fileData : undefined);
    if (!sent) return;
    setMessage("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleFocus = () => {
    // Keep the welcome content visible while the user is typing.
  };

  const handleBlur = () => {
    // Keep the welcome content visible until a message is successfully sent.
  };

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

  // Archives the active conversation into Recents, if it has any messages.
  const archiveActiveChat = () => {
    if (messages.length === 0) return;
  };

  // Archives the active conversation into Recents, then resets the chat back
  // to its empty/welcome state.
  const handleNewChat = () => {
    archiveActiveChat();
    startNewChat();
    setMessage("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsRecentsOpen(false);
  };

  // Archives the active conversation (so it isn't lost), then loads the
  // selected Recents entry's own messages back into the chat.
  const handleOpenRecent = async (item: RecentItem) => {
    if (!selectedProject || loadingSessionId) return;
    setLoadingSessionId(item.id);
    try {
      const restored = await getChatSessionMessages(selectedProject.id, item.id);
      archiveActiveChat();
      loadMessages(restored);
      setMessage("");
      setAttachments([]);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setIsRecentsOpen(false);
    } catch {
      setRecentsError("Unable to open this chat.");
    } finally {
      setLoadingSessionId(null);
    }
  };

  // Buckets Recents into their time-group sections (Today, Yesterday, ...),
  // preserving each group's first-appearance order in `recentItems`.
  const recentGroups = useMemo(() => {
    const order: string[] = [];
    const byGroup = new Map<string, RecentItem[]>();
    for (const item of recentItems) {
      if (!byGroup.has(item.group)) {
        byGroup.set(item.group, []);
        order.push(item.group);
      }
      byGroup.get(item.group)!.push(item);
    }
    return order.map((group) => ({ group, items: byGroup.get(group)! }));
  }, [recentItems]);

  // â”€â”€ Derived state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const navHidden = isKeyboardOpen || isSoftKeyboard;

  const inputWrapperPb = navHidden
    ? "max(var(--safe-bottom), 0.5rem)"
    : "calc(var(--nav-height, 3.5rem) + max(var(--safe-bottom), 0.75rem) + 0.75rem)";

  const chatInputProps: ChatInputProps = {
    message,
    attachments,
    textareaRef,
    fileInputRef,
    onInput:            handleInput,
    onFocus:            handleFocus,
    onBlur:             handleBlur,
    onSend:             handleSend,
    onAttachClick:      handleAttachClick,
    onFileChange:       handleFileChange,
    onRemoveAttachment: handleRemoveAttachment,
    sendDisabled:       isSending || !isConnected,
    isSending,
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
    /* {
      key: "agents" as Screen,
      label: "Agent",
      icon: (active: boolean) => (
        <Bot
          size={24} strokeWidth={1.5}
          style={{ color: active ? "var(--purple-1000)" : "var(--grey-500)" }}
        />
      ),
    }, */
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
    /* {
      key: "approvals" as Screen,
      label: "Approvals",
      icon: (active: boolean) => (
        <UserRoundCheckIcon
          size={24}
          style={{ color: active ? "var(--purple-1000)" : "var(--grey-500)" }}
        />
      ),
    }, */
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
      {/* â”€â”€ Header â”€â”€ â€” sticky so it can never be scrolled out of view.
          Grid (not flex) so the two side columns share one width token
          (--btn-size-36): that's what keeps the middle column's content
          mathematically centered on the header regardless of screen width,
          matching the design's equal left/right margins around the chip. */}
      <header
        className="sticky top-0 z-30 w-full grid items-center flex-shrink-0 bg-[var(--background)] px-2 pb-[var(--spacing-4)] gap-2"
        style={{ gridTemplateColumns: "var(--btn-size-36) 1fr var(--btn-size-36)" }}
      >
        <button
          type="button"
          aria-label="Open menu"
          onClick={(e) => { e.stopPropagation(); setIsRecentsOpen(true); }}
          className="flex items-center justify-center flex-shrink-0 rounded-xl text-[var(--foreground)] hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)] touch-manipulation"
          style={{ width: "var(--btn-size-36)", height: "var(--btn-size-36)" }}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Project selector uses content-driven Hug sizing and remains bounded
            by the center header column on narrow screens. */}
        <div className="flex justify-center min-w-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsProjectPickerOpen(true); }}
            className="flex min-w-0 max-w-full w-fit items-center gap-2 rounded-xl border border-[var(--grey-300)] bg-[var(--background)] px-[var(--spacing-12)] py-[var(--spacing-4)] text-[var(--foreground)] transition-colors hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)] touch-manipulation"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--grey-700)]">
              {selectedProject ? getProjectIcon(selectedProject) : <Folder className="h-6 w-6" strokeWidth={1.5} />}
            </span>
            <span className="min-w-0 truncate text-body-14-m">{selectedProject?.name ?? "Project"}</span>
            <ChevronDown className="h-5 w-5 shrink-0 text-[var(--grey-700)]" strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          onClick={(e) => { e.stopPropagation(); onNavigate("notifications"); }}
          className="flex items-center justify-center flex-shrink-0 rounded-xl text-[var(--foreground)] hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)] touch-manipulation justify-self-end"
          style={{ width: "var(--btn-size-36)", height: "var(--btn-size-36)" }}
        >
          <Bell className="w-6 h-6" />
        </button>
      </header>

      {/* â”€â”€ Body â”€â”€ */}
      {messages.length === 0 ? (
        /* â”€â”€ Welcome / empty state â”€â”€ */
        <div className="flex flex-col flex-1 min-h-0">
          {/*
           * main stays flex-1 in both states so the input below it stays pinned to the
           * bottom (unchanged). Idle: justify-center, perfectly centred. Focused (typing
           * a first message, nothing sent yet): justify-start plus a symmetric clamp()
           * top/bottom padding around the block, so it settles a little higher with even
           * breathing room â€” a subtle shift (Gemini-style), not a jump to the top â€” fluid
           * across viewport heights instead of a fixed value, animated for a smooth move.
           */}
          <main
            className="flex-1 flex flex-col items-center justify-center w-full min-h-0 overflow-hidden px-[var(--spacing-16)]"
            style={{
              paddingTop: "clamp(1rem, 4dvh, 2.5rem)",
              paddingBottom: "clamp(1rem, 4dvh, 2.5rem)",
            }}
          >
            <img
              src={logoAsset}
              alt="Logo"
              className="object-contain mx-auto mb-[var(--spacing-16)]"
              style={{
                width:       "clamp(4rem, 12vw, 6.25rem)",
                aspectRatio: "1 / 1",
              }}
            />
            <h1
              className="font-semibold text-center whitespace-nowrap mb-[var(--spacing-4)]"
              style={{
                fontSize:   "clamp(1.375rem, 6vw, 1.875rem)",
                lineHeight: 1.5,
                color:      "var(--grey-1000)",
              }}
            >
              Welcome back
            </h1>
            <p
              className="font-medium text-center whitespace-nowrap"
              style={{
                fontSize:   "clamp(0.625rem, 4.2vw, 1rem)",
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
            {connectionError && (
              <p
                className="text-center px-4 pb-2"
                style={{ fontSize: "0.75rem", color: "var(--error-600)" }}
              >
                {connectionError}
              </p>
            )}
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
            {messages.map((msg) =>
              msg.role === "user" ? (
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
              ) : (
                /* Assistant response rendered as Markdown. Raw internal
                   reasoning is never shown to the user. */
                <div key={msg.id} className="flex w-full justify-start">
                  <div
                    className="bg-white border border-[var(--grey-200)] text-[var(--grey-900)] rounded-[1.125rem]"
                    style={{ maxWidth: "88%", padding: "0.625rem 0.75rem" }}
                  >
                    {msg.isStreaming && (
                      <details className="mb-2 rounded-xl border border-[var(--purple-700)] px-3 py-2 text-[var(--purple-700)]">
                        <summary className="flex cursor-pointer select-none items-center text-xs font-medium marker:text-[var(--purple-700)]">
                          Thinking
                          <span className="ml-1 inline-flex items-center gap-0.5" aria-hidden="true">
                            <span className="size-1 rounded-full bg-[var(--purple-700)] animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="size-1 rounded-full bg-[var(--purple-700)] animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="size-1 rounded-full bg-[var(--purple-700)] animate-bounce" style={{ animationDelay: "300ms" }} />
                          </span>
                        </summary>
                        <div className="mt-1 pl-3 text-xs leading-5">
                          {msg.toolCalls && msg.toolCalls.length > 0 ? (
                            msg.toolCalls.map((tool) => (
                              <div key={tool.toolCallId} className="flex items-center gap-1.5">
                                <span aria-hidden="true">&gt;</span>
                                <span>{tool.status === "completed" ? `Completed ${tool.toolName}` : `Calling ${tool.toolName}`}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span aria-hidden="true">&gt;</span>
                              <span>Working on your request</span>
                            </div>
                          )}
                        </div>
                      </details>
                    )}

                    {msg.text ? (
                      <div
                        className={`break-words font-normal ${msg.isError ? "text-[var(--error-600)]" : ""}`}
                        style={{ fontSize: "0.875rem", lineHeight: "1.375rem" }}
                      >
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-5 mb-2 last:mb-0">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 last:mb-0">{children}</ol>,
                            li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
                            h1: ({ children }) => <h1 className="font-semibold text-base mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="font-semibold text-sm mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="font-semibold text-sm mb-1">{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-[var(--grey-300)] pl-3 italic mb-2">
                                {children}
                              </blockquote>
                            ),
                            code: ({ children, className }) => (
                              <code className={`${className ?? ""} rounded bg-[var(--grey-100)] px-1 py-0.5 text-[0.8125em]`}>
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="overflow-x-auto rounded-lg bg-[var(--grey-100)] p-3 mb-2 text-[0.8125em]">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : null}

                    {msg.pendingQuestion && (
                      <QuestionCard pending={msg.pendingQuestion} onSubmit={answerQuestion} />
                    )}
                    {msg.pendingAction && (
                      <ActionCard pending={msg.pendingAction} onResolve={resolveAction} />
                    )}
                  </div>
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            className="w-full flex-shrink-0 bg-[var(--background)]"
            style={{ paddingBottom: inputWrapperPb, paddingTop: "0.5rem" }}
          >
            {connectionError && (
              <p
                className="text-center px-4 pb-2"
                style={{ fontSize: "0.75rem", color: "var(--error-600)" }}
              >
                {connectionError}
              </p>
            )}
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

          <div className="w-full flex-shrink-0 px-4 pb-3">
            <button
              type="button"
              aria-label="Change project"
              onClick={() => setIsProjectPickerOpen(true)}
              className="w-full min-w-0 flex items-center gap-2 rounded-lg bg-[var(--grey-300)] px-3 py-2 text-left text-[var(--grey-1000)] transition-colors active:bg-[var(--grey-400)] touch-manipulation"
            >
              <LayoutGrid
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-[var(--purple-700)]"
                strokeWidth={2}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {selectedProject?.name ?? "Select a project"}
              </span>
              <ChevronDown
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-[var(--grey-700)]"
              />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto w-full">
            {isLoadingRecents && (
              <p className="px-4 py-6 text-sm text-[var(--grey-500)]">Loading recent chats...</p>
            )}
            {recentsError && (
              <p className="px-4 py-6 text-sm text-[var(--grey-700)]">{recentsError}</p>
            )}
            {!isLoadingRecents && !recentsError && recentItems.length === 0 && (
              <p className="px-4 py-6 text-sm text-[var(--grey-500)]">No recent chats.</p>
            )}
            {recentGroups.map(({ group, items }) => (
              <div key={group} className="flex flex-col">
                <h3
                  className="px-4 pt-3 pb-1 font-medium text-[var(--grey-500)]"
                  style={{ fontSize: "0.75rem", lineHeight: "1rem" }}
                >
                  {group}
                </h3>
                <ul className="flex flex-col pb-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleOpenRecent(item)}
                        disabled={loadingSessionId !== null}
                        className="w-full flex items-center justify-between text-left active:bg-[var(--grey-100)] transition-colors touch-manipulation px-4 py-2"
                        style={{ minHeight: "2.5rem" }}
                      >
                        <span className="flex items-center gap-2 min-w-0" style={{ maxWidth: "75%" }}>
                          <Sparkle
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 text-[var(--purple-700)]"
                            fill="none"
                            strokeWidth={2}
                          />
                          <span
                            className="font-semibold text-[var(--grey-1000)] truncate"
                            style={{ fontSize: "0.875rem", lineHeight: "1.25rem" }}
                          >
                            {loadingSessionId === item.id ? "Loading..." : item.title}
                          </span>
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
            ))}
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
                className="rounded-full bg-[var(--purple-1000)] text-white flex items-center justify-center font-semibold shrink-0"
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
              className="shrink-0 rounded-[var(--spacing-12)] border border-[var(--purple-1000)] text-[var(--purple-1000)] font-medium active:bg-[var(--purple-100)] transition-colors touch-manipulation"
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
        className={`fixed bottom-0 left-0 z-[70] w-full max-h-[90dvh] overflow-y-auto bg-white rounded-t-[var(--radius)] transition-transform duration-300 ease-in-out ${
          isLogoutOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          paddingBottom: "max(var(--safe-bottom), var(--spacing-12))",
          paddingInline: "clamp(var(--spacing-12), 5vw, var(--spacing-16))",
        }}
      >
        <div className="flex justify-center py-[var(--spacing-4)]">
          <div
            className="rounded-full bg-[var(--grey-300)]"
            style={{ width: "clamp(2rem, 12vw, var(--btn-size-36))", height: "var(--spacing-4)" }}
          />
        </div>
        <div className="pt-[var(--spacing-12)] pb-[var(--spacing-4)]">
          <div className="flex items-center gap-[var(--spacing-12)]">
            <div
              className="flex shrink-0 items-center justify-center rounded-full bg-[var(--purple-1000)] text-body-12-sb text-white"
              style={{ width: "var(--btn-size-36)", height: "var(--btn-size-36)" }}
            >
              {currentUser.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-body-12-sb text-[var(--grey-1000)]">
                {currentUser.name}
              </p>
              <p className="truncate text-captions-12 text-[var(--grey-500)]">
                {currentUser.email}
              </p>
            </div>
          </div>
        </div>
        <div className="pt-[var(--spacing-4)]">
          <p className="mb-[var(--spacing-4)] text-captions-12 font-medium text-[var(--grey-500)]">
            Organizations
          </p>
          <div className="overflow-hidden rounded-[var(--spacing-12)] border border-[var(--grey-300)]">
            {isLoadingOrganizations && (
              <p className="px-[var(--spacing-12)] py-[var(--spacing-12)] text-body-12-m text-[var(--grey-500)]">Loading organizations...</p>
            )}
            {organizationError && (
              <p className="px-[var(--spacing-12)] py-[var(--spacing-12)] text-body-12-m text-[var(--grey-700)]">{organizationError}</p>
            )}
            {!isLoadingOrganizations && !organizationError && organizations.map((organization, organizationIndex) => {
              const isSelected = organization.id === organizationId;
              const access = getOrganizationAccess(organization);
              const organizationIconColor = organizationIndex % 2 === 0
                ? "var(--organization-icon-purple)"
                : "var(--organization-icon-blue)";
              return (
                <button
                  key={organization.id}
                  type="button"
                  disabled={isSelected || switchingOrganizationId !== null}
                  onClick={() => {
                    setSwitchingOrganizationId(organization.id);
                    onSelectOrganization(organization)
                      .then(() => {
                        setIsLogoutOpen(false);
                        setIsRecentsOpen(false);
                      })
                      .catch(() => {
                        setOrganizationError("Unable to switch organization.");
                      })
                      .finally(() => {
                        setSwitchingOrganizationId(null);
                      });
                  }}
                  className={`flex min-h-[var(--btn-size-36)] w-full items-center gap-[var(--spacing-12)] border-b border-[var(--grey-100)] px-[var(--spacing-12)] py-[var(--spacing-4)] text-left transition-colors last:border-b-0 touch-manipulation ${
                    isSelected ? "bg-[var(--grey-200)]" : "active:bg-[var(--grey-100)]"
                  }`}
                >
                  <span
                    className="flex shrink-0 items-center justify-center rounded-full text-captions-12 font-semibold text-white"
                    style={{ backgroundColor: organizationIconColor, width: "var(--spacing-16)", height: "var(--spacing-16)" }}
                  >
                    {organization.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="flex-1 truncate text-body-12-m text-[var(--grey-1000)]">
                    {organization.name}
                  </span>
                  {access && (
                    <span className="shrink-0 text-captions-12 text-[var(--grey-500)]">
                      {access}
                    </span>
                  )}
                  {switchingOrganizationId === organization.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--purple-1000)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="border-t border-[var(--grey-300)] pt-[var(--spacing-16)]">
          <p className="mb-[var(--spacing-4)] text-captions-12 font-medium text-[var(--grey-500)]">
            Account
          </p>
        </div>
        <div className="overflow-hidden rounded-[var(--spacing-12)] border border-[var(--grey-300)]">
          <button
            type="button"
            onClick={() => {
              setIsLogoutOpen(false);
              setIsRecentsOpen(false);
              onNavigate("signin");
            }}
            className="flex min-h-[var(--btn-size-36)] w-full items-center justify-between px-[var(--spacing-12)] py-[var(--spacing-12)] transition-colors active:bg-[var(--grey-100)] touch-manipulation"
          >
            <span className="text-body-14-m text-red-600">
              Logout
            </span>
            <LogOut className="h-4 w-4 text-red-600" />
          </button>
        </div>
        <p className="pt-[var(--spacing-16)] text-center text-captions-12 text-[var(--grey-500)]">
          Synngular
        </p>
      </div>

      <ProjectPickerSheet
        isOpen={isProjectPickerOpen}
        onClose={() => setIsProjectPickerOpen(false)}
        organizationId={organizationId}
        selectedProject={selectedProject}
        onSelectProject={(project) => {
          onSelectProject(project);
          setIsProjectPickerOpen(false);
        }}
      />
    </div>
  );
};

export default HomeScreen;