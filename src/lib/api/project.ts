import { apiRequest } from "./client";

// TODO: remove once the app supports switching projects/orgs everywhere that
// still needs one before a real selection has been made (e.g. jumping to the
// Agents/Outputs tabs before ever opening the project picker).
export const DEFAULT_PROJECT_ID = "22de0787-e4ab-4f1c-b298-7db484921630";

export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export type ProjectType = "GENERAL" | "SOFTWARE_ENGINEERING";

export type ProjectSubType =
  | "EMPTY_PROJECT"
  | "DATA_CHAT"
  | "MIGRATION"
  | "API"
  | "WEB_APP"
  | "DESKTOP_APP";

export interface ApiProject {
  id: string;
  name: string;
  description: string | null;
  type: ProjectType;
  subType: ProjectSubType;
  status: ProjectStatus;
  organizationId: string;
  hasGitHubConnected: boolean;
  integrations: unknown[];
  organisations: { id: string; name: string };
  _count: { agents: number };
  createdAt: string;
}

export interface ListProjectsParams {
  organizationId: string;
  search?: string;
  status?: ProjectStatus;
  sortBy?: "name" | "createdAt" | "status";
  sortOrder?: "asc" | "desc";
}

export interface ListProjectsResponse {
  success: boolean;
  projects: ApiProject[];
}

export function listProjects(params: ListProjectsParams): Promise<ListProjectsResponse> {
  const query = new URLSearchParams({ organizationId: params.organizationId });
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  return apiRequest<ListProjectsResponse>(`/api/projects?${query.toString()}`);
}

// Remembers the last project worked in, per organization, so a silently
// resumed session (app killed from Recents, relaunched — see the session
// restore in App.tsx) can skip straight back to it instead of always
// re-showing the project picker. A fresh sign-in (real OTP verification)
// deliberately never reads this — that flow always routes through
// project-select, which is the only place besides logout this should reset.
const selectedProjectStorageKey = (organizationId: string) => `synngular:selectedProject:${organizationId}`;

export function saveSelectedProject(organizationId: string, project: ApiProject): void {
  try {
    localStorage.setItem(selectedProjectStorageKey(organizationId), JSON.stringify(project));
  } catch {
    // Storage unavailable (e.g. private browsing) — selection just won't persist.
  }
}

export function loadSelectedProject(organizationId: string): ApiProject | null {
  try {
    const raw = localStorage.getItem(selectedProjectStorageKey(organizationId));
    return raw ? (JSON.parse(raw) as ApiProject) : null;
  } catch {
    return null;
  }
}
