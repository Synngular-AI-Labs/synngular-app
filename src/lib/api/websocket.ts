import { apiRequest } from "./client";

export interface WebSocketTicketResponse {
  success: boolean;
  ticket: string;
  expiresAt: string;
}

// Short-lived (15 min) ticket that authenticates the Socket.IO handshake —
// see lib/chat/useSocketChat.ts. Cookie-authenticated like every other REST
// call, obtained fresh before each connection attempt.
export function getWebSocketTicket(
  organizationId: string,
  projectId: string
): Promise<WebSocketTicketResponse> {
  return apiRequest<WebSocketTicketResponse>("/api/websocket/ticket", {
    method: "POST",
    body: JSON.stringify({ organizationId, projectId }),
  });
}
