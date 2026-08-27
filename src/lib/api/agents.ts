import { apiRequest } from "./client";

// TODO: replace with the user's actual project once project selection/lookup
// exists in the app — there is currently only one project to work against.
const DEFAULT_PROJECT_ID = "22de0787-e4ab-4f1c-b298-7db484921630";

export type AgentStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type AgentType = "GRAPH" | "CLASSIC";

export interface AgentTrigger {
  type: string;
  value: string;
}

export interface AgentLlmProvider {
  name: string;
  providerType: string;
}

export interface AgentLlmModelConfig {
  id: string;
  name: string;
  modelName: string;
  provider: AgentLlmProvider;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  agentType: AgentType;
  status: AgentStatus;
  association: string;
  triggers: AgentTrigger[];
  llmModelConfig: AgentLlmModelConfig;
}

export interface ListAgentsResponse {
  success: boolean;
  agents: Agent[];
  agentRunCounts: Record<string, number>;
  agentBindings: Record<string, unknown>;
}

export function listAgents(
  status: AgentStatus = "ACTIVE"
): Promise<ListAgentsResponse> {
  const params = new URLSearchParams({ status });
  return apiRequest<ListAgentsResponse>(
    `/api/projects/${DEFAULT_PROJECT_ID}/agents?${params.toString()}`
  );
}
