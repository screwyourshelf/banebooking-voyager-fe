import type { MinBookingRespons, OppdaterProfilForespørsel } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";

function accountPath(slug: string, suffix: string) {
  return `klubb/${encodeURIComponent(slug)}/${suffix}`;
}

export function getMyBookings(
  api: ApiClient,
  slug: string,
  includeHistorical: boolean,
  signal?: AbortSignal
) {
  const query = includeHistorical ? "?inkluderHistoriske=true" : "";
  return api.request<MinBookingRespons[]>(accountPath(slug, `bookinger/mine${query}`), {
    auth: "required",
    signal,
  });
}

export function cancelMyBooking(api: ApiClient, slug: string, bookingId: string) {
  return api.request<unknown>(accountPath(slug, `bookinger/${encodeURIComponent(bookingId)}`), {
    auth: "required",
    method: "DELETE",
  });
}

export function updateMyProfile(api: ApiClient, slug: string, request: OppdaterProfilForespørsel) {
  return api.request<void, OppdaterProfilForespørsel>(accountPath(slug, "bruker/meg"), {
    auth: "required",
    method: "PATCH",
    json: request,
  });
}

export function deleteMyAccount(api: ApiClient, slug: string) {
  return api.request<void>(accountPath(slug, "bruker/meg"), {
    auth: "required",
    method: "DELETE",
  });
}

export function getMyAccountData(api: ApiClient, slug: string) {
  return api.request<unknown>(accountPath(slug, "bruker/meg/egen-data"), { auth: "required" });
}
