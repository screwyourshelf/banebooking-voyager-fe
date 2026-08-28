import type {
  AksepterVilkårForespørsel,
  BrukerRespons,
  FeedStatusRespons,
  KlubbRespons,
} from "$lib/contracts";
import { AKTIV_VILKAAR } from "$lib/domain";
import type { ApiClient } from "$lib/platform/api";

export function getKlubb(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<KlubbRespons>(`klubb/${encodeURIComponent(slug)}`, { auth: "none", signal });
}

export function getFeedStatus(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<FeedStatusRespons>(`klubb/${encodeURIComponent(slug)}/feed/status`, {
    auth: "none",
    signal,
  });
}

/**
 * Bevarer dagens bootkontrakt: en innlogget bruker registrerer aktiv vilkårsversjon før guards
 * vurderes. Navnet gjør den tilsiktede POST-sideeffekten synlig for querykonsumenten.
 */
export async function getBrukerWithCurrentTermsAcceptance(
  api: ApiClient,
  slug: string,
  signal?: AbortSignal
) {
  const path = `klubb/${encodeURIComponent(slug)}/bruker`;
  let bruker =
    (await api.request<BrukerRespons | null | undefined>(path, { auth: "required", signal })) ??
    null;

  if (bruker && !bruker.vilkårAkseptertDato) {
    bruker = await api.request<BrukerRespons, AksepterVilkårForespørsel>(`${path}/vilkaar`, {
      method: "POST",
      auth: "required",
      json: { versjon: AKTIV_VILKAAR.versjon },
      signal,
    });
  }

  return bruker;
}
