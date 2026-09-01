import { apiRequest } from "./client";

export interface Organization {
  id: string;
  name: string;
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
