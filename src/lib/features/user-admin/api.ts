import type {
  BrukerRespons,
  BrukerSperrerRespons,
  OppdaterBrukerForespørsel,
  OpphevSperreRespons,
  SperrBrukerForespørsel,
  SperrBrukerRespons,
} from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";

function usersPath(slug: string, suffix = "") {
  const root = `klubb/${encodeURIComponent(slug)}/bruker/admin/bruker`;
  return suffix ? `${root}/${suffix}` : root;
}

function userPath(slug: string, userId: string, suffix = "") {
  const root = usersPath(slug, encodeURIComponent(userId));
  return suffix ? `${root}/${suffix}` : root;
}

export function getAdminUsers(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<BrukerRespons[]>(usersPath(slug), { auth: "required", signal });
}

export function updateAdminUser(
  api: ApiClient,
  slug: string,
  userId: string,
  request: OppdaterBrukerForespørsel
) {
  return api.request<void, OppdaterBrukerForespørsel>(userPath(slug, userId), {
    auth: "required",
    method: "PUT",
    json: request,
  });
}

export function deleteAdminUser(api: ApiClient, slug: string, userId: string) {
  return api.request<void>(userPath(slug, userId), { auth: "required", method: "DELETE" });
}

export function getUserBlocks(api: ApiClient, slug: string, userId: string, signal?: AbortSignal) {
  return api.request<BrukerSperrerRespons>(userPath(slug, userId, "sperr"), {
    auth: "required",
    signal,
  });
}

export function blockUser(
  api: ApiClient,
  slug: string,
  userId: string,
  request: SperrBrukerForespørsel
) {
  return api.request<SperrBrukerRespons, SperrBrukerForespørsel>(userPath(slug, userId, "sperr"), {
    auth: "required",
    method: "POST",
    json: request,
  });
}

export function revokeUserBlock(api: ApiClient, slug: string, userId: string, blockId: string) {
  return api.request<OpphevSperreRespons>(
    userPath(slug, userId, `sperr/${encodeURIComponent(blockId)}`),
    { auth: "required", method: "DELETE" }
  );
}
