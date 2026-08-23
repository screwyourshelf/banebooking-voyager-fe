import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import {
  blockUser,
  deleteAdminUser,
  getAdminUsers,
  getUserBlocks,
  revokeUserBlock,
  updateAdminUser,
} from "./api";

describe("user admin API", () => {
  it("eier alle bruker- og sperreendepunktene med kodede identifikatorer", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = { request } as unknown as ApiClient;

    await getAdminUsers(api, "fjord vik");
    await updateAdminUser(api, "fjord vik", "user/id", {
      rolle: "Utvidet",
      visningsnavn: "Ola",
    });
    await deleteAdminUser(api, "fjord vik", "user/id");
    await getUserBlocks(api, "fjord vik", "user/id");
    await blockUser(api, "fjord vik", "user/id", {
      type: "ManuellSperre",
      årsak: "Brudd på reglene",
      aktivTil: null,
    });
    await revokeUserBlock(api, "fjord vik", "user/id", "block/id");

    expect(request.mock.calls).toEqual([
      ["klubb/fjord%20vik/bruker/admin/bruker", { signal: undefined }],
      [
        "klubb/fjord%20vik/bruker/admin/bruker/user%2Fid",
        {
          method: "PUT",
          json: { rolle: "Utvidet", visningsnavn: "Ola" },
        },
      ],
      ["klubb/fjord%20vik/bruker/admin/bruker/user%2Fid", { method: "DELETE" }],
      ["klubb/fjord%20vik/bruker/admin/bruker/user%2Fid/sperr", { signal: undefined }],
      [
        "klubb/fjord%20vik/bruker/admin/bruker/user%2Fid/sperr",
        {
          method: "POST",
          json: { type: "ManuellSperre", årsak: "Brudd på reglene", aktivTil: null },
        },
      ],
      [
        "klubb/fjord%20vik/bruker/admin/bruker/user%2Fid/sperr/block%2Fid",
        {
          method: "DELETE",
        },
      ],
    ]);
  });
});
