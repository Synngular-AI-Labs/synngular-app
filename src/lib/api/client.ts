import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { isTauri } from "@tauri-apps/api/core";

// plugin-http is a Tauri IPC call and only works inside an actual Tauri window.
// Falling back to the native fetch lets `npm run dev` in a plain browser tab still
// work during UI development; the packaged app always uses plugin-http above.
const httpFetch = isTauri() ? tauriFetch : window.fetch.bind(window);

// A real browser tab enforces CORS on the absolute URL; the packaged app doesn't
// (plugin-http's native client isn't subject to it). So outside Tauri, route through
// Vite's dev-server proxy (see vite.config.ts) with a relative path instead.
const BASE_URL = isTauri() ? import.meta.env.VITE_API_BASE_URL : "";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (isTauri() && !BASE_URL) {
    throw new Error(
      "VITE_API_BASE_URL is not set. Define it in your .env file."
    );
  }

  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // The backend sets the session as an HttpOnly cookie (auth_token), not a bearer
  // token, so there's nothing to attach manually — just make sure it's sent back.
  // Native (plugin-http) manages its own persistent cookie jar regardless of this
  // option; it only matters for the browser-dev-preview `window.fetch` path.
  const response = await httpFetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}
