import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import { createAnnouncement, deactivateAnnouncement, getActiveAnnouncement } from "./api";

describe("announcement admin API", () => {
  it("eier lese-, opprettings- og deaktiveringsendepunktene med kodede identifikatorer", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = { request } as unknown as ApiClient;
    const body = {
      tittel: "Viktig beskjed",
      tekst: '{"type":"doc"}',
      utløperTidspunkt: "2026-09-01T00:00:00.000Z",
    };

    await expect(getActiveAnnouncement(api, "fjord vik")).resolves.toBeNull();
    await createAnnouncement(api, "fjord vik", body);
    await deactivateAnnouncement(api, "fjord vik", "announcement/id");

    expect(request.mock.calls).toEqual([
      ["klubb/fjord%20vik/kunngjøringer/aktiv", { signal: undefined }],
      ["klubb/fjord%20vik/kunngjøringer", { method: "POST", json: body }],
      ["klubb/fjord%20vik/kunngjøringer/announcement%2Fid", { method: "DELETE" }],
    ]);
  });
});
