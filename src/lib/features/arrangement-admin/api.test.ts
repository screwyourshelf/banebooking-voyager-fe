import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import {
  addArrangementBookingsBatch,
  createArrangement,
  deleteArrangementBooking,
  getAdminArrangements,
  previewArrangementEdit,
  updateArrangementBooking,
  updateArrangementMetadata,
} from "./api";

describe("arrangement-admin endpoints", () => {
  it("bevarer paths, metoder og typed bodies", async () => {
    const request = vi.fn().mockResolvedValue([]);
    const api = { request } as unknown as ApiClient;
    const arrangementRequest = {
      baneGrupper: [{ baneIder: ["court"], tidspunkter: ["08:00"] }],
      grenId: "activity",
      kategori: "Kurs" as const,
      sluttDato: "2026-08-24",
      startDato: "2026-08-24",
      tittel: "Kurs",
      ukedager: ["Monday" as const],
    };

    await getAdminArrangements(api, "fjord vik");
    await previewArrangementEdit(api, "fjord vik", "event/1", arrangementRequest);
    await createArrangement(api, "fjord vik", arrangementRequest);
    await updateArrangementMetadata(api, "fjord vik", "event/1", {
      kategori: "Kurs",
      publisertPåNettsiden: false,
    });
    await addArrangementBookingsBatch(api, "fjord vik", "event/1", {
      bookinger: [{ baneId: "court", dato: "2026-08-24", sluttTid: "09:00", startTid: "08:00" }],
    });
    const bookingRequest = {
      baneId: "court",
      dato: "2026-08-25",
      sluttTid: "10:00",
      startTid: "09:00",
    };
    await updateArrangementBooking(api, "fjord vik", "event/1", "booking/1", bookingRequest);
    await deleteArrangementBooking(api, "fjord vik", "event/1", "booking/1");

    expect(request.mock.calls).toEqual([
      ["klubb/fjord%20vik/arrangementer", { auth: "required", signal: undefined }],
      [
        "klubb/fjord%20vik/arrangement/event%2F1/forhandsvis",
        { auth: "required", method: "PUT", json: arrangementRequest },
      ],
      [
        "klubb/fjord%20vik/arrangement",
        { auth: "required", method: "POST", json: arrangementRequest },
      ],
      [
        "klubb/fjord%20vik/arrangement/event%2F1/metadata",
        {
          auth: "required",
          method: "PATCH",
          json: { kategori: "Kurs", publisertPåNettsiden: false },
        },
      ],
      [
        "klubb/fjord%20vik/arrangement/event%2F1/bookinger/batch",
        expect.objectContaining({ auth: "required", method: "POST" }),
      ],
      [
        "klubb/fjord%20vik/arrangement/event%2F1/bookinger/booking%2F1",
        { auth: "required", method: "PUT", json: bookingRequest },
      ],
      [
        "klubb/fjord%20vik/arrangement/event%2F1/bookinger/booking%2F1",
        { auth: "required", method: "DELETE" },
      ],
    ]);
  });
});
