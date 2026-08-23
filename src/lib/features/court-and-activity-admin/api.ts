import type {
  BaneRespons,
  GrenRespons,
  OpprettBaneForespørsel,
  OpprettGrenForespørsel,
  OppdaterBaneBookingInnstillingerForespørsel,
  OppdaterBaneForespørsel,
  OppdaterGrenForespørsel,
} from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";

function resourcePath(slug: string, resource: string) {
  return `klubb/${encodeURIComponent(slug)}/${resource}`;
}

export function getAdminCourts(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<BaneRespons[]>(resourcePath(slug, "baner?inkluderInaktive=true"), { signal });
}

export function getAdminActivities(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<GrenRespons[]>(resourcePath(slug, "grener?inkluderInaktive=true"), {
    signal,
  });
}

export function createCourt(api: ApiClient, slug: string, request: OpprettBaneForespørsel) {
  return api.request<void, OpprettBaneForespørsel>(resourcePath(slug, "baner"), {
    method: "POST",
    json: request,
  });
}

export function updateCourt(
  api: ApiClient,
  slug: string,
  courtId: string,
  request: OppdaterBaneForespørsel
) {
  return api.request<void, OppdaterBaneForespørsel>(
    resourcePath(slug, `baner/${encodeURIComponent(courtId)}`),
    { method: "PUT", json: request }
  );
}

export function updateCourtBookingSettings(
  api: ApiClient,
  slug: string,
  courtId: string,
  request: OppdaterBaneBookingInnstillingerForespørsel
) {
  return api.request<void, OppdaterBaneBookingInnstillingerForespørsel>(
    resourcePath(slug, `baner/${encodeURIComponent(courtId)}/booking-innstillinger`),
    { method: "PUT", json: request }
  );
}

export function createActivity(api: ApiClient, slug: string, request: OpprettGrenForespørsel) {
  return api.request<void, OpprettGrenForespørsel>(resourcePath(slug, "grener"), {
    method: "POST",
    json: request,
  });
}

export function updateActivity(
  api: ApiClient,
  slug: string,
  activityId: string,
  request: OppdaterGrenForespørsel
) {
  return api.request<void, OppdaterGrenForespørsel>(
    resourcePath(slug, `grener/${encodeURIComponent(activityId)}`),
    { method: "PUT", json: request }
  );
}
