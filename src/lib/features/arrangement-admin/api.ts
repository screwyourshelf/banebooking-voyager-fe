import type {
  ArrangementBookingRespons,
  ArrangementForhåndsvisningRespons,
  ArrangementRespons,
  BaneRespons,
  BatchLeggTilArrangementBookingerForespørsel,
  BatchLeggTilArrangementBookingerRespons,
  GrenRespons,
  LeggTilArrangementBookingForespørsel,
  OpprettArrangementForespørsel,
  OpprettArrangementRespons,
  OppdaterArrangementMetadataForespørsel,
  OppdaterArrangementMetadataRespons,
  SlettArrangementRespons,
} from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";

function clubPath(slug: string, resource: string) {
  return `klubb/${encodeURIComponent(slug)}/${resource}`;
}

export function getAdminArrangements(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<ArrangementRespons[]>(clubPath(slug, "arrangementer"), {
    auth: "required",
    signal,
  });
}

export function getArrangementActivities(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<GrenRespons[]>(clubPath(slug, "grener"), { auth: "required", signal });
}

export function getArrangementCourts(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<BaneRespons[]>(clubPath(slug, "baner"), { auth: "required", signal });
}

export function getArrangementBookings(
  api: ApiClient,
  slug: string,
  arrangementId: string,
  signal?: AbortSignal
) {
  return api.request<ArrangementBookingRespons[]>(
    clubPath(slug, `arrangement/${encodeURIComponent(arrangementId)}/bookinger`),
    { auth: "required", signal }
  );
}

export function previewArrangement(
  api: ApiClient,
  slug: string,
  request: OpprettArrangementForespørsel
) {
  return api.request<ArrangementForhåndsvisningRespons, OpprettArrangementForespørsel>(
    clubPath(slug, "arrangement/forhandsvis"),
    { auth: "required", method: "POST", json: request }
  );
}

export function createArrangement(
  api: ApiClient,
  slug: string,
  request: OpprettArrangementForespørsel
) {
  return api.request<OpprettArrangementRespons, OpprettArrangementForespørsel>(
    clubPath(slug, "arrangement"),
    {
      auth: "required",
      method: "POST",
      json: request,
    }
  );
}

export function updateArrangementMetadata(
  api: ApiClient,
  slug: string,
  arrangementId: string,
  request: OppdaterArrangementMetadataForespørsel
) {
  return api.request<OppdaterArrangementMetadataRespons, OppdaterArrangementMetadataForespørsel>(
    clubPath(slug, `arrangement/${encodeURIComponent(arrangementId)}/metadata`),
    { auth: "required", method: "PATCH", json: request }
  );
}

export function deleteArrangement(api: ApiClient, slug: string, arrangementId: string) {
  return api.request<SlettArrangementRespons>(
    clubPath(slug, `arrangement/${encodeURIComponent(arrangementId)}`),
    { auth: "required", method: "DELETE" }
  );
}

export function addArrangementBooking(
  api: ApiClient,
  slug: string,
  arrangementId: string,
  request: LeggTilArrangementBookingForespørsel
) {
  return api.request<ArrangementBookingRespons, LeggTilArrangementBookingForespørsel>(
    clubPath(slug, `arrangement/${encodeURIComponent(arrangementId)}/bookinger`),
    { auth: "required", method: "POST", json: request }
  );
}

export function updateArrangementBooking(
  api: ApiClient,
  slug: string,
  arrangementId: string,
  bookingId: string,
  request: LeggTilArrangementBookingForespørsel
) {
  return api.request<ArrangementBookingRespons, LeggTilArrangementBookingForespørsel>(
    clubPath(
      slug,
      `arrangement/${encodeURIComponent(arrangementId)}/bookinger/${encodeURIComponent(bookingId)}`
    ),
    { auth: "required", method: "PUT", json: request }
  );
}

export function addArrangementBookingsBatch(
  api: ApiClient,
  slug: string,
  arrangementId: string,
  request: BatchLeggTilArrangementBookingerForespørsel
) {
  return api.request<
    BatchLeggTilArrangementBookingerRespons,
    BatchLeggTilArrangementBookingerForespørsel
  >(clubPath(slug, `arrangement/${encodeURIComponent(arrangementId)}/bookinger/batch`), {
    auth: "required",
    method: "POST",
    json: request,
  });
}

export function deleteArrangementBooking(
  api: ApiClient,
  slug: string,
  arrangementId: string,
  bookingId: string
) {
  return api.request<void>(
    clubPath(
      slug,
      `arrangement/${encodeURIComponent(arrangementId)}/bookinger/${encodeURIComponent(bookingId)}`
    ),
    { auth: "required", method: "DELETE" }
  );
}
