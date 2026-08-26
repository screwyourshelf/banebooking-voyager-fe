import type {
  AktiverMedlemskapBekreftelseForespørsel,
  MedlemskapBekreftelseRespons,
  MedlemskapStatusRespons,
  OppdaterKlubbForespørsel,
} from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";

function clubPath(slug: string, suffix = "") {
  const root = `klubb/${encodeURIComponent(slug)}`;
  return suffix ? `${root}/${suffix}` : root;
}

export function updateClub(api: ApiClient, slug: string, request: OppdaterKlubbForespørsel) {
  return api.request<void, OppdaterKlubbForespørsel>(clubPath(slug), {
    auth: "required",
    method: "PUT",
    json: request,
  });
}

export function getMembershipStatus(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<MedlemskapStatusRespons>(clubPath(slug, "medlemskap/status"), {
    auth: "required",
    signal,
  });
}

export function activateMembershipConfirmation(
  api: ApiClient,
  slug: string,
  request: AktiverMedlemskapBekreftelseForespørsel
) {
  return api.request<MedlemskapBekreftelseRespons, AktiverMedlemskapBekreftelseForespørsel>(
    clubPath(slug, "medlemskap/aktiver"),
    { auth: "required", method: "POST", json: request }
  );
}

export function deactivateMembershipConfirmation(api: ApiClient, slug: string) {
  return api.request<void>(clubPath(slug, "medlemskap/aktiver"), {
    auth: "required",
    method: "DELETE",
  });
}
