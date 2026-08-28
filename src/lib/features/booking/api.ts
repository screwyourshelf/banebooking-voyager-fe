import type {
  AktivtArrangementRespons,
  BaneRespons,
  BookingBootstrapRespons,
  BookingSuksessRespons,
  GrenRespons,
  KalenderRespons,
  OpprettBookingForespørsel,
} from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";

function tenantPath(slug: string, resource: string) {
  return `klubb/${encodeURIComponent(slug)}/${resource}`;
}

export function getBookingBootstrap(
  api: ApiClient,
  slug: string,
  date: string,
  signal?: AbortSignal
) {
  return api.request<BookingBootstrapRespons>(
    tenantPath(slug, `booking-bootstrap?dato=${encodeURIComponent(date)}`),
    { auth: "optional", signal }
  );
}

export function getBookingActivities(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<GrenRespons[]>(tenantPath(slug, "grener"), { auth: "optional", signal });
}

export function getBookingCourts(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<BaneRespons[]>(tenantPath(slug, "baner"), { auth: "optional", signal });
}

export function getBookingCalendar(
  api: ApiClient,
  slug: string,
  courtId: string,
  date: string,
  signal?: AbortSignal
) {
  const query = new URLSearchParams({ baneId: courtId, dato: date });
  return api.request<KalenderRespons>(tenantPath(slug, `kalender?${query}`), {
    auth: "optional",
    signal,
  });
}

export function createBooking(api: ApiClient, slug: string, request: OpprettBookingForespørsel) {
  return api.request<BookingSuksessRespons, OpprettBookingForespørsel>(
    tenantPath(slug, "bookinger"),
    { auth: "required", method: "POST", json: request }
  );
}

export function cancelBooking(api: ApiClient, slug: string, bookingId: string) {
  return api.request<BookingSuksessRespons>(
    tenantPath(slug, `bookinger/${encodeURIComponent(bookingId)}`),
    { auth: "required", method: "DELETE" }
  );
}

export function getActiveArrangements(
  api: ApiClient,
  slug: string,
  activityId: string,
  signal?: AbortSignal
) {
  return api.request<AktivtArrangementRespons[]>(
    tenantPath(slug, `arrangement/aktive?grenId=${encodeURIComponent(activityId)}`),
    { auth: "optional", signal }
  );
}
