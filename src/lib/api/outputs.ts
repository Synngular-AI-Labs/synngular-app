import { apiRequest } from "./client";

export interface OutputBlockSummary {
  blockId: string;
  title: string;
  kind: string;
}

export interface OutputBlock extends OutputBlockSummary {
  html: string;
}

export interface OutputSummary {
  name: string;
  title: string;
  description: string | null;
  artifactId: string;
  updatedAt: string;
}

export interface OutputDetail {
  output: string;
  title: string;
  blocks: OutputBlock[];
}

export interface ListOutputsResponse {
  success: boolean;
  data: OutputSummary[];
}

export interface GetOutputResponse {
  success: boolean;
  data: OutputDetail;
}

export function listOutputs(projectId: string): Promise<ListOutputsResponse> {
  return apiRequest<ListOutputsResponse>(
    `/api/projects/${projectId}/outputs`
  );
}

export function getOutput(projectId: string, output: string): Promise<GetOutputResponse> {
  return apiRequest<GetOutputResponse>(
    `/api/projects/${projectId}/outputs/${encodeURIComponent(output)}`
  );
}
