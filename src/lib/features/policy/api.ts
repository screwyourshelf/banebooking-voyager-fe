import type { BekreftMedlemskapForespørsel } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";

export function confirmRequiredAnnouncement(api: ApiClient, slug: string, announcementId: string) {
  return api.request<void>(
    `klubb/${encodeURIComponent(slug)}/kunngjøringer/${encodeURIComponent(announcementId)}/bekreft`,
    { auth: "required", method: "POST" }
  );
}

export function confirmMembership(
  api: ApiClient,
  slug: string,
  request: BekreftMedlemskapForespørsel
) {
  return api.request<void, BekreftMedlemskapForespørsel>(
    `klubb/${encodeURIComponent(slug)}/bruker/bekreft-medlemskap`,
    { auth: "required", method: "POST", json: request }
  );
}
