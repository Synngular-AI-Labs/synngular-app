import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getWebSocketTicket } from "../api/websocket";

// Falls back to a Math.random-based v4 when crypto.randomUUID isn't available
// (older Android WebViews) — only needs to be locally unique, not cryptographic.
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export interface ChatToolCall {
  toolCallId: string;
  toolName: string;
  status: "pending" | "completed";
}

export interface ChatFile {
  url: string;
  type: string;
  name: string;
}

export type QuestionAnswerType = "text" | "single-choice" | "multi-choice";

export interface ChatQuestionItem {
  question: string;
  answerType: QuestionAnswerType;
  options?: string[];
}

export interface QuestionResponse {
  question: string;
  answer: string | string[];
}

export interface PendingQuestion {
  toolCallId: string;
  questions: ChatQuestionItem[];
}

export type ActionFieldType = "text" | "number" | "boolean" | "date" | "select";

export interface ActionField {
  key: string;
  label: string;
  type: ActionFieldType;
  required?: boolean;
  options?: string[];
}

export type ActionType =
  | "approval"
  | "yes_no"
  | "choice"
  | "confirm"
  | "form"
  | "acknowledge"
  | "custom";

// Who consumes the action's result — "agent" resumes the stream, "ui" doesn't,
// "both" does both.
export type ActionRoute = "agent" | "ui" | "both";

export interface ChatActionRequest {
  actionType: ActionType;
  route: ActionRoute;
  title?: string;
  prompt?: string;
  options?: string[];
  multiple?: boolean;
  destructive?: boolean;
  fields?: ActionField[];
  context?: unknown;
}

export interface ActionResult {
  status: "resolved" | "cancelled";
  values?: Record<string, unknown>;
  comment?: string;
}

export interface PendingAction {
  actionId: string;
  action: ChatActionRequest;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  isStreaming?: boolean;
  isError?: boolean;
  reasoning?: string;
  toolCalls?: ChatToolCall[];
  // Local-only preview of attachments picked in the composer — the protocol
  // has no file field on chat.message, so these are never actually sent.
  files?: ChatFile[];
  // Set while the agent has paused mid-turn waiting on the user (doc §7).
  // Both can theoretically be present; each renders its own card.
  pendingQuestion?: PendingQuestion;
  pendingAction?: PendingAction;
}

interface UseSocketChatParams {
  organizationId: string | null;
  projectId: string;
  userId: string | null;
}

const MAX_RECONNECT_ATTEMPTS = 3;
// Idle window, not a hard cap on total turn length — re-armed on every sign of
// life from the agent (chat.reasoning/chat.tool_call/chat.tool_result/chat.chunk),
// so a "composer" turn that fans out to multiple sub-agents and legitimately runs
// for minutes isn't killed mid-stream just for taking a while. Only fires if the
// server goes fully silent for this long (hung agent, dropped connection, or
// paused on a question/action that never gets an answer).
const TURN_TIMEOUT_MS = 60000;

// Real-time agent chat over Socket.IO — see MOBILE_CHAT_SOCKETIO_INTEGRATION.md.
// Handles the full turn lifecycle including HITL pauses (chat.question,
// chat.action) via answerQuestion/resolveAction. Still not handled: the
// chat.render/html/draft/composer_graph/spec_changed side-channels — there's
// no card design for those yet, so their content just doesn't render.
export function useSocketChat({ organizationId, projectId, userId }: UseSocketChatParams) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const assistantMessageIdRef = useRef<string | null>(null);
  const turnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTurnTimeout = useCallback(() => {
    if (turnTimeoutRef.current) {
      clearTimeout(turnTimeoutRef.current);
      turnTimeoutRef.current = null;
    }
  }, []);

  const updateAssistantMessage = useCallback((updater: (message: ChatMessage) => ChatMessage) => {
    const id = assistantMessageIdRef.current;
    if (!id) return;
    setMessages((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));
  }, []);

  const failTurn = useCallback(
    (text: string) => {
      updateAssistantMessage((m) => ({ ...m, isStreaming: false, isError: true, text: m.text || text }));
      assistantMessageIdRef.current = null;
      turnTimeoutRef.current = null;
      setIsSending(false);
    },
    [updateAssistantMessage]
  );

  const armTurnTimeout = useCallback(() => {
    clearTurnTimeout();
    turnTimeoutRef.current = setTimeout(() => {
      failTurn("The agent took too long to respond. Please try again.");
    }, TURN_TIMEOUT_MS);
  }, [clearTurnTimeout, failTurn]);

  const buildRoom = useCallback(() => {
    return `${organizationId}/${projectId}/${userId}/${sessionIdRef.current}`;
  }, [organizationId, projectId, userId]);

  // A chat session belongs to exactly one project on the backend. Without this,
  // switching projects mid-conversation (the header picker) would keep reusing
  // sessionIdRef from the old project while the socket reconnects into a room
  // scoped to the new one — the backend has no session under that room, so it
  // never replies and the turn silently times out.
  const projectIdRef = useRef(projectId);
  useEffect(() => {
    if (projectIdRef.current === projectId) return;
    projectIdRef.current = projectId;
    clearTurnTimeout();
    sessionIdRef.current = null;
    assistantMessageIdRef.current = null;
    setIsSending(false);
    setMessages([]);
  }, [projectId, clearTurnTimeout]);

  useEffect(() => {
    if (!organizationId || !userId) return;
    let cancelled = false;
    let socket: Socket | null = null;

    const attachHandlers = (s: Socket, attempt: number) => {
      // TEMP DEBUG — logs every inbound socket event so we can see exactly what
      // (if anything) the backend sends back after chat.message. Remove once the
      // "no response" issue is confirmed fixed.
      s.onAny((event: string, ...args: unknown[]) => {
        console.log("[chat.socket] <=", event, args);
      });

      s.on("connect", () => {
        console.log("[chat.socket] connected", { id: s.id, organizationId, projectId, userId });
        if (cancelled) return;
        setIsConnected(true);
        setConnectionError(null);
      });

      s.on("disconnect", (reason: string) => {
        console.log("[chat.socket] disconnected", { reason });
        if (cancelled) return;
        setIsConnected(false);
        if (attempt < MAX_RECONNECT_ATTEMPTS) {
          setTimeout(() => connectWithRetry(attempt + 1), 2 ** attempt * 1000);
        } else {
          setConnectionError("Connection lost. Please reopen the chat.");
        }
      });

      s.on("connect_error", (err: Error) => {
        console.log("[chat.socket] connect_error", err.message, (err as { data?: unknown }).data);
        if (cancelled) return;
        setConnectionError(err.message || "Unable to connect to chat.");
      });

      s.on("chat.reasoning", ({ text }: { text: string }) => {
        armTurnTimeout();
        updateAssistantMessage((m) => ({ ...m, reasoning: (m.reasoning ?? "") + text }));
      });

      s.on("chat.tool_call", ({ toolCallId, toolName }: { toolCallId: string; toolName: string }) => {
        armTurnTimeout();
        updateAssistantMessage((m) => ({
          ...m,
          toolCalls: [...(m.toolCalls ?? []), { toolCallId, toolName, status: "pending" }],
        }));
      });

      s.on("chat.tool_result", ({ toolCallId }: { toolCallId: string }) => {
        armTurnTimeout();
        updateAssistantMessage((m) => ({
          ...m,
          toolCalls: (m.toolCalls ?? []).map((t) =>
            t.toolCallId === toolCallId ? { ...t, status: "completed" } : t
          ),
        }));
      });

      // HITL pause — the agent is waiting on the user, not us on it, so the
      // "took too long" timeout doesn't apply until the user actually answers.
      s.on("chat.question", ({ toolCallId, questions }: { toolCallId: string; questions: ChatQuestionItem[] }) => {
        clearTurnTimeout();
        updateAssistantMessage((m) => ({ ...m, pendingQuestion: { toolCallId, questions } }));
      });

      s.on("chat.action", ({ actionId, action }: { actionId: string; action: ChatActionRequest }) => {
        clearTurnTimeout();
        updateAssistantMessage((m) => ({ ...m, pendingAction: { actionId, action } }));
      });

      s.on("chat.chunk", ({ text }: { text: string }) => {
        armTurnTimeout();
        updateAssistantMessage((m) => ({ ...m, text: m.text + text }));
      });

      s.on("chat.done", ({ awaitingResponse, awaitingAction }: { awaitingResponse?: boolean; awaitingAction?: boolean }) => {
        clearTurnTimeout();
        updateAssistantMessage((m) => ({ ...m, isStreaming: false }));
        // A pending question/action card is already attached (chat.question/
        // chat.action always arrive before chat.done per the protocol) — keep
        // assistantMessageIdRef pointing at it so answering it later still
        // targets the same bubble, and keep the composer locked until then.
        if (!awaitingResponse && !awaitingAction) {
          assistantMessageIdRef.current = null;
          setIsSending(false);
        }
      });

      // Server emits "chat.error" (matching every other chat.* event) for an
      // in-turn failure. The bare "error" is also handled defensively in case
      // a transport/middleware-level error ever comes through unnamespaced.
      const handleServerError = ({ message }: { message?: string }) => {
        clearTurnTimeout();
        failTurn(message || "Something went wrong.");
      };
      s.on("chat.error", handleServerError);
      s.on("error", handleServerError);
    };

    const connectWithRetry = async (attempt: number) => {
      if (cancelled) return;
      try {
        const { ticket } = await getWebSocketTicket(organizationId, projectId);
        if (cancelled) return;
        socket = io(import.meta.env.VITE_SDK_WS_URL, {
          auth: { ticket },
          transports: ["websocket"],
          reconnection: false,
        });
        socketRef.current = socket;
        attachHandlers(socket, attempt);
      } catch (err) {
        if (cancelled) return;
        console.error("getWebSocketTicket failed:", err);
        if (attempt < MAX_RECONNECT_ATTEMPTS) {
          setTimeout(() => connectWithRetry(attempt + 1), 2 ** attempt * 1000);
        } else {
          setConnectionError("Unable to connect to chat.");
        }
      }
    };

    connectWithRetry(0);

    return () => {
      cancelled = true;
      clearTurnTimeout();
      socket?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [organizationId, projectId, userId, updateAssistantMessage, clearTurnTimeout, failTurn, armTurnTimeout]);

  const sendMessage = useCallback(
    (text: string, files?: ChatFile[]) => {
      const socket = socketRef.current;
      const trimmed = text.trim();
      if (!socket || !isConnected || isSending || !organizationId || !userId || !trimmed) return false;

      if (!sessionIdRef.current) sessionIdRef.current = generateId();

      const userMessage: ChatMessage = { id: generateId(), role: "user", text: trimmed, files };
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        text: "",
        isStreaming: true,
      };
      assistantMessageIdRef.current = assistantMessage.id;
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsSending(true);

      const payload = {
        room: buildRoom(),
        data: {
          chatSessionId: sessionIdRef.current,
          projectId,
          // "composer" is the backend's reserved id for the default dispatch/
          // routing agent (the "General assistant" on the web platform) — it
          // fans a message out to the right sub-agent itself, so the client
          // never needs to resolve a real per-project agentId to chat.
          agentId: "composer",
          message: trimmed,
        },
      };
      console.log("[chat.socket] => chat.message", payload);
      socket.emit("chat.message", payload);
      armTurnTimeout();
      return true;
    },
    [organizationId, projectId, userId, isConnected, isSending, buildRoom, armTurnTimeout]
  );

  // Answers a chat.question (doc §7.1) — the agent always resumes afterwards.
  const answerQuestion = useCallback(
    (toolCallId: string, responses: QuestionResponse[]) => {
      const socket = socketRef.current;
      if (!socket || !sessionIdRef.current || !organizationId || !userId) return;
      updateAssistantMessage((m) => ({ ...m, pendingQuestion: undefined, isStreaming: true }));
      setIsSending(true);
      socket.emit("chat.tool_response", {
        room: buildRoom(),
        data: { chatSessionId: sessionIdRef.current, toolCallId, responses },
      });
      armTurnTimeout();
    },
    [organizationId, userId, buildRoom, updateAssistantMessage, armTurnTimeout]
  );

  // Resolves a chat.action (doc §7.2) — only "agent"/"both" routes resume the
  // stream; a "ui"-routed action is fully handled here and the turn ends.
  const resolveAction = useCallback(
    (actionId: string, result: ActionResult, route: ActionRoute) => {
      const socket = socketRef.current;
      if (!socket || !sessionIdRef.current || !organizationId || !userId) return;
      const willResume = route === "agent" || route === "both";
      updateAssistantMessage((m) => ({ ...m, pendingAction: undefined, isStreaming: willResume }));
      socket.emit("chat.action_response", {
        room: buildRoom(),
        data: { chatSessionId: sessionIdRef.current, actionId, result },
      });
      if (willResume) {
        setIsSending(true);
        armTurnTimeout();
      } else {
        clearTurnTimeout();
        assistantMessageIdRef.current = null;
        setIsSending(false);
      }
    },
    [organizationId, userId, buildRoom, updateAssistantMessage, armTurnTimeout, clearTurnTimeout]
  );

  // Manually aborts a stuck/in-flight turn (doc §7.3) — surfaced as a "Stop"
  // button in place of Send while a turn is streaming, so a hang doesn't
  // require reopening the chat (partial text already streamed is kept).
  const stopStreaming = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !sessionIdRef.current || !organizationId || !userId) return;
    clearTurnTimeout();
    socket.emit("chat.stop", { room: buildRoom(), data: { chatSessionId: sessionIdRef.current } });
    updateAssistantMessage((m) => ({ ...m, isStreaming: false }));
    assistantMessageIdRef.current = null;
    setIsSending(false);
  }, [organizationId, userId, buildRoom, clearTurnTimeout, updateAssistantMessage]);

  const startNewChat = useCallback(() => {
    clearTurnTimeout();
    sessionIdRef.current = null;
    assistantMessageIdRef.current = null;
    setIsSending(false);
    setMessages([]);
  }, [clearTurnTimeout]);

  // Swaps in a previously-archived (Recents) conversation. There's no real
  // session-resume wired up yet (see MOBILE_CHAT_SOCKETIO_INTEGRATION.md §9.2),
  // so this only restores the message list for display — sending a new
  // message afterwards starts a fresh chatSessionId/room rather than
  // continuing the original server-side session.
  const loadMessages = useCallback((restored: ChatMessage[]) => {
    clearTurnTimeout();
    sessionIdRef.current = null;
    assistantMessageIdRef.current = null;
    setIsSending(false);
    setMessages(restored);
  }, [clearTurnTimeout]);

  return {
    messages,
    isConnected,
    isSending,
    connectionError,
    sendMessage,
    answerQuestion,
    resolveAction,
    stopStreaming,
    startNewChat,
    loadMessages,
  };
}
