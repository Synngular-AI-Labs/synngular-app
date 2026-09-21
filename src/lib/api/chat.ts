import { apiRequest } from "./client";
import type { ChatMessage } from "../chat/useSocketChat";

export interface ChatSessionSummary {
  id: string;
  title?: string | null;
  firstMessage?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  pinned?: boolean;
  messageCount?: number;
}

interface ChatSessionDetail extends ChatSessionSummary {
  messages?: unknown[];
}

interface SessionsResponse {
  sessions?: ChatSessionSummary[];
}

interface SessionResponse {
  session?: ChatSessionDetail;
  messages?: unknown[];
}

const sessionPath = (projectId: string, sessionId?: string) =>
  `/api/projects/${encodeURIComponent(projectId)}/chat/sessions${
    sessionId ? `/${encodeURIComponent(sessionId)}` : ""
  }`;

export async function listChatSessions(projectId: string): Promise<ChatSessionSummary[]> {
  const raw = await apiRequest<SessionsResponse | ChatSessionSummary[]>(sessionPath(projectId));
  return Array.isArray(raw) ? raw : raw.sessions ?? [];
}

const messageText = (message: Record<string, unknown>): string => {
  const content = message.content ?? message.text ?? message.message;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          const value = (part as Record<string, unknown>).text;
          return typeof value === "string" ? value : "";
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
};

const normalizeMessage = (message: unknown, index: number): ChatMessage | null => {
  if (!message || typeof message !== "object") return null;
  const raw = message as Record<string, unknown>;
  const role = raw.role === "assistant" ? "assistant" : raw.role === "user" ? "user" : null;
  const text = messageText(raw);
  if (!role || !text) return null;
  return { id: typeof raw.id === "string" ? raw.id : `restored-${index}`, role, text };
};

export async function getChatSessionMessages(
  projectId: string,
  sessionId: string,
): Promise<ChatMessage[]> {
  const raw = await apiRequest<SessionResponse | ChatSessionDetail>(sessionPath(projectId, sessionId));
  const detail = "session" in raw ? raw.session : raw;
  const messages = detail?.messages ?? ("messages" in raw ? raw.messages : undefined) ?? [];
  return messages.map(normalizeMessage).filter((message): message is ChatMessage => message !== null);
}