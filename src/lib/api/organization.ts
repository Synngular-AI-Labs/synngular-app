import { apiRequest } from "./client";
import { getSubscriptionStatus, hasActiveSubscription } from "./subscription";

export interface Organization {
  id: string;
  name: string;
  access?: string | null;
  role?: string | null;
  userRole?: string | null;
  membership?: {
    access?: string | null;
    role?: string | null;
  } | null;
}

// The exact success shape of GET /api/user/organisations hasn't been
// confirmed against a real payload — this parses defensively across the
// shapes the rest of this API uses for lists ({ organisations: [...] } or
// { organizations: [...] }) as well as a bare array, so a spelling/wrapper
// mismatch doesn't crash the app.
export async function listOrganizations(): Promise<Organization[]> {
  const raw = await apiRequest<unknown>("/api/user/organisations");
  if (Array.isArray(raw)) return raw as Organization[];
  const body = raw as
    | { organisations?: Organization[]; organizations?: Organization[] }
    | null
    | undefined;
  return body?.organisations ?? body?.organizations ?? [];
}

export function getOrganizationAccess(organization: Organization): string | null {
  const access =
    organization.access ??
    organization.role ??
    organization.userRole ??
    organization.membership?.access ??
    organization.membership?.role;
  if (!access) return null;
  return access.charAt(0).toUpperCase() + access.slice(1).toLowerCase();
}

export async function findOrganizationWithActiveSubscription(
  organizations: Organization[],
): Promise<Organization | null> {
  const statuses = await Promise.all(
    organizations.map(async (organization) => ({
      organization,
      subscription: await getSubscriptionStatus(organization.id),
    })),
  );
  return statuses.find(({ subscription }) => hasActiveSubscription(subscription))?.organization ?? null;
}
