import { apiRequest } from "./client";

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPriceInCents: number;
}

export interface Subscription {
  id: string;
  status: string;
  organizationId: string;
}

export interface SubscriptionStatusResponse {
  hasSubscription: boolean;
  subscription?: Subscription;
  plan?: SubscriptionPlan;
  status?: string;
}

export function getSubscriptionStatus(orgId: string): Promise<SubscriptionStatusResponse> {
  const params = new URLSearchParams({ orgId });
  return apiRequest<SubscriptionStatusResponse>(`/api/subscription/status?${params.toString()}`);
}

// Mobile rule from the API docs: no subscription, or a canceled one, blocks
// chat access and should route to the paywall instead.
export function hasActiveSubscription(response: SubscriptionStatusResponse): boolean {
  return response.hasSubscription && response.status !== "CANCELED";
}
