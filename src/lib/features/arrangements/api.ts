import type { ArrangementRespons, SlettArrangementRespons } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";

function clubPath(slug: string, suffix: string) {
  return `klubb/${encodeURIComponent(slug)}/${suffix}`;
}

export function getArrangements(
  api: ApiClient,
  slug: string,
  includeHistorical: boolean,
  authenticated: boolean,
  signal?: AbortSignal
) {
  const query = includeHistorical ? "?inkluderHistoriske=true" : "";
  const path = authenticated
    ? clubPath(slug, `arrangementer${query}`)
    : `offentlig/${clubPath(slug, `arrangementer/visning${query}`)}`;
  return api.request<ArrangementRespons[]>(path, {
    auth: authenticated ? "required" : "none",
    signal,
  });
}

export function cancelArrangement(api: ApiClient, slug: string, arrangementId: string) {
  return api.request<SlettArrangementRespons>(
    clubPath(slug, `arrangement/${encodeURIComponent(arrangementId)}`),
    { auth: "required", method: "DELETE" }
  );
}
