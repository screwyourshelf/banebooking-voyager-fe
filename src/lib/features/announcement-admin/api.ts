import type { KunngjøringAdminRespons, OpprettKunngjøringForespørsel } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";

function announcementsPath(slug: string, suffix = "") {
  const root = `klubb/${encodeURIComponent(slug)}/kunngjøringer`;
  return suffix ? `${root}/${suffix}` : root;
}

export async function getActiveAnnouncement(api: ApiClient, slug: string, signal?: AbortSignal) {
  const response = await api.request<KunngjøringAdminRespons | null | undefined>(
    announcementsPath(slug, "aktiv"),
    { signal }
  );
  return response ?? null;
}

export function createAnnouncement(
  api: ApiClient,
  slug: string,
  request: OpprettKunngjøringForespørsel
) {
  return api.request<KunngjøringAdminRespons, OpprettKunngjøringForespørsel>(
    announcementsPath(slug),
    { method: "POST", json: request }
  );
}

export function deactivateAnnouncement(api: ApiClient, slug: string, announcementId: string) {
  return api.request<void>(announcementsPath(slug, encodeURIComponent(announcementId)), {
    method: "DELETE",
  });
}
