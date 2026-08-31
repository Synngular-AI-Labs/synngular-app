import { apiRequest } from "./client";
import { DEFAULT_PROJECT_ID } from "./project";

export interface OutputBlockSummary {
  blockId: string;
  title: string;
  kind: string;
}

export interface OutputBlock extends OutputBlockSummary {
  html: string;
}

export interface OutputSummary {
  output: string;
  title: string;
  description: string;
  blocks: OutputBlockSummary[];
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

export function listOutputs(): Promise<ListOutputsResponse> {
  return apiRequest<ListOutputsResponse>(
    `/api/projects/${DEFAULT_PROJECT_ID}/outputs`
  );
}

export function getOutput(output: string): Promise<GetOutputResponse> {
  return apiRequest<GetOutputResponse>(
    `/api/projects/${DEFAULT_PROJECT_ID}/outputs/${encodeURIComponent(output)}`
  );
}
