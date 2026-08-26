import type { AksepterVilkårForespørsel, BrukerRespons, KlubbRespons } from "$lib/contracts";
import { AKTIV_VILKAAR } from "$lib/domain";
import type { ApiClient } from "$lib/platform/api";

export function getKlubb(api: ApiClient, slug: string) {
  return api.request<KlubbRespons>(`klubb/${encodeURIComponent(slug)}`);
}

/**
 * Bevarer dagens bootkontrakt: en innlogget bruker registrerer aktiv vilkårsversjon før guards
 * vurderes. Navnet gjør den tilsiktede POST-sideeffekten synlig for querykonsumenten.
 */
export async function getBrukerWithCurrentTermsAcceptance(api: ApiClient, slug: string) {
  const path = `klubb/${encodeURIComponent(slug)}/bruker`;
  let bruker = (await api.request<BrukerRespons | null | undefined>(path)) ?? null;

  if (bruker && !bruker.vilkårAkseptertDato) {
    await api.request<void, AksepterVilkårForespørsel>(`${path}/vilkaar`, {
      method: "POST",
      json: { versjon: AKTIV_VILKAAR.versjon },
    });
    bruker = (await api.request<BrukerRespons | null | undefined>(path)) ?? null;
  }

  return bruker;
}
