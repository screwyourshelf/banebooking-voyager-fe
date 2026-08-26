import type {
  BaneRespons,
  BookingstatistikkFiltre,
  BookingstatistikkRespons,
  GrenRespons,
} from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";

function clubPath(slug: string, resource: string) {
  return `klubb/${encodeURIComponent(slug)}/${resource}`;
}

export function getBookingStatistics(
  api: ApiClient,
  slug: string,
  filters: BookingstatistikkFiltre,
  signal?: AbortSignal
) {
  const parameters = new URLSearchParams({
    fra: filters.fra,
    til: filters.til,
    sammenlignMedForrigeÅr: String(filters.sammenlignMedForrigeÅr),
  });
  if (filters.grenId) parameters.set("grenId", filters.grenId);
  if (filters.baneId) parameters.set("baneId", filters.baneId);

  return api.request<BookingstatistikkRespons>(
    clubPath(slug, `statistikk/bookinger?${parameters.toString()}`),
    { auth: "required", signal }
  );
}

export function getStatisticsActivities(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<GrenRespons[]>(clubPath(slug, "grener?inkluderInaktive=true"), {
    auth: "required",
    signal,
  });
}

export function getStatisticsCourts(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<BaneRespons[]>(clubPath(slug, "baner?inkluderInaktive=true"), {
    auth: "required",
    signal,
  });
}
