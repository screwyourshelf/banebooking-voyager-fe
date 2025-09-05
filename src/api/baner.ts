import { fetchWithAuth } from "./fetchWithAuth.js";
import type { Bane, NyBane, OppdaterBane } from "../types/index.js";

export async function hentBaner(
  slug: string,
  inkluderInaktive = false
): Promise<Bane[]> {
  const query = inkluderInaktive ? "?inkluderInaktive=true" : "";
  const res = await fetchWithAuth(`/api/klubb/${slug}/baner${query}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function oppdaterBane(
  slug: string,
  id: string,
  dto: OppdaterBane
): Promise<void> {
  await fetchWithAuth(
    `/api/klubb/${slug}/baner/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(dto),
    },
    true
  );
}

export async function opprettBane(slug: string, dto: NyBane): Promise<void> {
  await fetchWithAuth(
    `/api/klubb/${slug}/baner`,
    {
      method: "POST",
      body: JSON.stringify(dto),
    },
    true
  );
}
