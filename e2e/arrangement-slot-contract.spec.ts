import { expect, test } from "@playwright/test";
import type {
  ArrangementBookingRespons,
  BaneRespons,
  KalenderRespons,
  OpprettArrangementForespørsel,
} from "../src/lib/contracts";
import {
  addArrangementBookingsBatch,
  createArrangement,
  deleteArrangement,
  getArrangementBookings,
  getArrangementCourts,
  previewArrangement,
  updateArrangementBooking,
} from "../src/lib/features/arrangement-admin/api";
import { createApiClient } from "../src/lib/platform/api/client";
import { E2E_BACKEND_ORIGIN, E2E_TENANT_SLUG } from "./environment";

test("arrangement preview, append and replacement share the persisted slot contract", async ({
  request,
}) => {
  const login = await request.post(`${E2E_BACKEND_ORIGIN}/api/dev-auth/login`, {
    data: { profile: "admin" },
  });
  expect(login.ok()).toBe(true);
  const { accessToken } = (await login.json()) as { accessToken: string };
  const api = createApiClient({
    baseUrl: `${E2E_BACKEND_ORIGIN}/api`,
    fetch: globalThis.fetch,
    getAuthorization: async () => ({ scheme: "DevelopmentBearer", token: accessToken }),
    onUnauthorized: async () => {
      throw new Error("Local admin session expired");
    },
  });
  const slug = E2E_TENANT_SLUG;
  const courts = (await getArrangementCourts(api, slug)).filter((court) => court.aktiv);
  let fixture: { court: BaneRespons; date: string; slots: KalenderRespons["slots"] } | undefined;
  for (let days = 1; days <= 7 && !fixture; days++) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    for (const court of courts) {
      const calendar = await api.request<KalenderRespons>(
        `klubb/${slug}/kalender?baneId=${court.id}&dato=${iso}`,
        { auth: "required" }
      );
      const slots = calendar.slots.filter((slot) => !slot.bookingId && !slot.erPassert);
      if (slots.length >= 3) {
        fixture = { court, date: iso, slots: slots.slice(0, 3) };
        break;
      }
    }
  }
  expect(fixture, "Needs three free slots in the local development database").toBeDefined();
  const { court, date, slots } = fixture!;
  const explicit = slots.map((slot) => ({
    baneId: court.id,
    dato: date,
    startTid: slot.slotStartTid,
    sluttTid: slot.slotSluttTid,
  }));
  const body: OpprettArrangementForespørsel = {
    grenId: court.grenId,
    tittel: `Slot contract ${Date.now()}`,
    kategori: "Trening",
    startDato: date,
    sluttDato: date,
    ukedager: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    baneGrupper: [{ baneIder: [court.id], tidspunkter: [explicit[2].startTid] }],
    eksplisitteSlots: [explicit[0]],
  };
  let arrangementId: string | undefined;
  try {
    const before = await previewArrangement(api, slug, body);
    expect(before.ledige).toHaveLength(1);
    const created = await createArrangement(api, slug, body);
    arrangementId = created.arrangementId;
    expect(created.antallOpprettet).toBe(1);
    const original = (await getArrangementBookings(api, slug, arrangementId))[0];
    expect(original).toMatchObject(explicit[0]);

    const addition = { ...body, eksplisitteSlots: [explicit[0], explicit[1], explicit[1]] };
    const preview = await previewArrangement(api, slug, addition);
    expect(preview.ledige).toHaveLength(1);
    expect(preview.konflikter).toHaveLength(2);
    const batch = await addArrangementBookingsBatch(api, slug, arrangementId, {
      bookinger: addition.eksplisitteSlots,
    });
    expect(batch.opprettet).toHaveLength(1);
    expect(batch.feilet).toHaveLength(2);
    expect(batch.opprettet[0]).toMatchObject(explicit[1]);

    // Updating the same booking excludes only itself from the overlap check.
    const updated = await updateArrangementBooking(
      api,
      slug,
      arrangementId,
      original.bookingId,
      explicit[0]
    );
    expect(updated.bookingId).toBe(original.bookingId);

    // The retained replacement API must honor explicit slots, even when groups differ.
    const replacement = { ...body, eksplisitteSlots: [explicit[1]] };
    const replacementPreview = await api.request<
      { ledige: unknown[]; konflikter: unknown[] },
      OpprettArrangementForespørsel
    >(`klubb/${slug}/arrangement/${arrangementId}/forhandsvis`, {
      auth: "required",
      method: "PUT",
      json: replacement,
    });
    expect(replacementPreview.ledige).toHaveLength(1);
    expect(replacementPreview.konflikter).toHaveLength(0);
    await api.request(`klubb/${slug}/arrangement/${arrangementId}`, {
      auth: "required",
      method: "PUT",
      json: replacement,
    });
    const persisted: ArrangementBookingRespons[] = await getArrangementBookings(
      api,
      slug,
      arrangementId
    );
    expect(persisted).toHaveLength(1);
    expect(persisted[0]).toMatchObject(explicit[1]);
  } finally {
    if (arrangementId && arrangementId !== "00000000-0000-0000-0000-000000000000") {
      await deleteArrangement(api, slug, arrangementId);
    }
  }
});
