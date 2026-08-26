// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import type { BrukerRespons, BrukerSperreRespons, BrukerSperrerRespons } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import UserAdminFixture from "./UserAdminFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
};

const objectCapabilities = [
  "bruker:endreRolle",
  "bruker:endreVisningsnavn",
  "bruker:slett",
  "bruker:sperr",
  "bruker:opphevSperre",
  "bruker:seSperre",
];

function createUsers(readOnly = false): BrukerRespons[] {
  return [
    {
      id: "user-self",
      epost: "ada@example.no",
      visningsnavn: "Ada Admin",
      roller: ["KlubbAdmin"],
      kapabiliteter: readOnly ? [] : ["bruker:seSperre", "bruker:endreVisningsnavn"],
      opprettetTid: "2026-08-01T10:00:00Z",
      medlemskapBekreftetDato: "2026-08-02T10:00:00Z",
      fulltNavn: "Ada Administrasjon",
      medlemskapType: "Voksen",
      erSperret: false,
      antallAktiveSperrer: 0,
    },
    {
      id: "user-ola",
      epost: "ola@example.no",
      visningsnavn: "Ola Medlem",
      roller: ["Medlem"],
      kapabiliteter: readOnly ? [] : objectCapabilities,
      opprettetTid: "2026-07-01T10:00:00Z",
      måBekrefteMedlemskap: true,
      fulltNavn: "Ola Nordmann",
      medlemskapType: "Familie",
      erSperret: false,
      antallAktiveSperrer: 0,
    },
    {
      id: "user-deleted",
      epost: "slettet_deadbeef@epost.no",
      visningsnavn: "",
      roller: ["Medlem"],
      kapabiliteter: readOnly ? [] : objectCapabilities,
      opprettetTid: "2026-06-01T10:00:00Z",
      erSperret: false,
      antallAktiveSperrer: 0,
    },
  ];
}

function createRequest(options: { readOnly?: boolean } = {}) {
  let users = createUsers(options.readOnly);
  let blocks: BrukerSperreRespons[] = [
    {
      id: "block-1",
      brukerId: "user-ola",
      klubbId: "club-1",
      klubbNavn: "Fjordvik",
      type: "ManuellSperre",
      aktivFra: "2026-08-10T10:00:00Z",
      aktivTil: null,
      årsak: "Tidligere regelbrudd",
      opprettetAv: "Ada Admin",
      opprettetTidspunkt: "2026-08-10T10:00:00Z",
      opphevtAv: null,
      opphevtTidspunkt: null,
      erAktiv: true,
    },
  ];

  return vi.fn(async (path: string, requestOptions?: { method?: string; json?: unknown }) => {
    const method = requestOptions?.method ?? "GET";
    if (path.endsWith("/bruker/admin/bruker") && method === "GET") return users;

    if (path.endsWith("/user-ola/sperr") && method === "GET") {
      return {
        brukerId: "user-ola",
        antallAktive: blocks.filter((block) => block.erAktiv).length,
        sperrer: blocks,
      } satisfies BrukerSperrerRespons;
    }

    if (path.endsWith("/user-ola") && method === "PUT") {
      const request = requestOptions?.json as {
        rolle: BrukerRespons["roller"][number];
        visningsnavn: string;
      };
      users = users.map((user) =>
        user.id === "user-ola"
          ? { ...user, roller: [request.rolle], visningsnavn: request.visningsnavn }
          : user
      );
      return undefined;
    }

    if (path.endsWith("/user-ola/sperr") && method === "POST") {
      users = users.map((user) =>
        user.id === "user-ola" ? { ...user, erSperret: true, antallAktiveSperrer: 1 } : user
      );
      return { sperre: blocks[0] };
    }

    if (path.endsWith("/user-ola/sperr/block-1") && method === "DELETE") {
      blocks = blocks.map((block) =>
        block.id === "block-1"
          ? {
              ...block,
              erAktiv: false,
              opphevtAv: "Ada Admin",
              opphevtTidspunkt: "2026-08-23T10:00:00Z",
            }
          : block
      );
      users = users.map((user) =>
        user.id === "user-ola" ? { ...user, erSperret: false, antallAktiveSperrer: 0 } : user
      );
      return { sperreId: "block-1", opphevtTidspunkt: "2026-08-23T10:00:00Z" };
    }

    if (path.endsWith("/user-ola") && method === "DELETE") {
      users = users.map((user) =>
        user.id === "user-ola" ? { ...user, epost: "slettet_ola@epost.no", visningsnavn: "" } : user
      );
      return undefined;
    }

    throw new Error(`Uventet API-kall: ${method} ${path}`);
  });
}

async function expandOla() {
  await fireEvent.click(await screen.findByText("Ola Medlem"));
}

describe("UserAdminScreen", () => {
  it("viser søk, filtre, slettet-toggle og en tilgjengelig administrasjonsliste", async () => {
    render(UserAdminFixture, { request: createRequest() as ApiClient["request"] });

    expect(await screen.findByRole("heading", { name: "2 brukere" })).toBeVisible();
    expect(screen.queryByText("slettet_deadbeef@epost.no")).toBeNull();
    const results = await axe.run(document.body, axeOptions);
    expect(results.violations).toEqual([]);

    await fireEvent.input(screen.getByRole("searchbox", { name: "Søk etter bruker" }), {
      target: { value: "Ada" },
    });
    expect(await screen.findByRole("heading", { name: "1 bruker" })).toBeVisible();
    expect(screen.queryByText("Ola Medlem")).toBeNull();

    await fireEvent.click(screen.getByRole("button", { name: "Nullstill" }));
    expect(await screen.findByText("Ola Medlem")).toBeVisible();
    await fireEvent.click(screen.getByRole("switch", { name: "Vis slettede" }));
    expect(await screen.findByText("slettet_deadbeef@epost.no")).toBeVisible();
  });

  it("bevarer en ren leseflate uten editor- eller destruktive handlinger", async () => {
    render(UserAdminFixture, {
      capabilities: ["brukere:lese"],
      request: createRequest({ readOnly: true }) as ApiClient["request"],
    });
    await expandOla();
    expect(screen.queryByRole("button", { name: "Rediger" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sperr" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Slett" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Vis historikk" })).toBeNull();
  });

  it("validerer editoren, fokuserer første feil og lagrer typed rolle/navn", async () => {
    const request = createRequest();
    render(UserAdminFixture, { request: request as ApiClient["request"] });
    await expandOla();
    await fireEvent.click(screen.getByRole("button", { name: "Rediger" }));
    const displayName = screen.getByRole("textbox", { name: "Visningsnavn" });
    await fireEvent.input(displayName, { target: { value: "X" } });
    await fireEvent.click(screen.getByRole("button", { name: "Lagre" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("minst 2 tegn");
    expect(displayName).toHaveFocus();

    await fireEvent.input(displayName, { target: { value: "Ola Oppdatert" } });
    const role = screen.getByRole("combobox", { name: "Rolle" });
    await fireEvent.keyDown(role, { key: "ArrowDown" });
    await fireEvent.keyDown(role, { key: "ArrowDown" });
    await fireEvent.keyDown(role, { key: "Enter" });
    await fireEvent.click(screen.getByRole("button", { name: "Lagre" }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "klubb/fjordvik/bruker/admin/bruker/user-ola",
        expect.objectContaining({
          auth: "required",
          method: "PUT",
          json: { rolle: "Utvidet", visningsnavn: "Ola Oppdatert" },
        })
      )
    );
    expect(await screen.findByText("Ola Oppdatert")).toBeVisible();
  });

  it("sperrer, viser historikk, opphever og sletter etter eksplisitt bekreftelse", async () => {
    const request = createRequest();
    render(UserAdminFixture, { request: request as ApiClient["request"] });
    await expandOla();
    await fireEvent.click(screen.getByRole("button", { name: "Sperr" }));
    const reason = screen.getByRole("textbox", { name: "Årsak" });
    await fireEvent.input(reason, { target: { value: "Brudd på reglene" } });
    await fireEvent.click(screen.getByRole("button", { name: "Sperr bruker" }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "klubb/fjordvik/bruker/admin/bruker/user-ola/sperr",
        expect.objectContaining({ auth: "required", method: "POST" })
      )
    );
    expect(await screen.findByText("Sperret")).toBeVisible();

    await fireEvent.click(screen.getByRole("button", { name: "Vis historikk" }));
    expect(await screen.findByText("Tidligere regelbrudd")).toBeVisible();
    await fireEvent.click(screen.getByRole("button", { name: "Opphev sperre" }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "klubb/fjordvik/bruker/admin/bruker/user-ola/sperr/block-1",
        { auth: "required", method: "DELETE" }
      )
    );
    expect((await screen.findAllByText(/Opphevet .* av Ada Admin/)).length).toBeGreaterThan(0);
    await fireEvent.click(screen.getByRole("button", { name: "Til brukeren" }));

    await fireEvent.click(screen.getByRole("button", { name: "Slett" }));
    expect(await screen.findByRole("heading", { name: "Slett bruker?" })).toBeVisible();
    await fireEvent.click(screen.getByRole("button", { name: "Slett bruker" }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith("klubb/fjordvik/bruker/admin/bruker/user-ola", {
        auth: "required",
        method: "DELETE",
      })
    );
    expect(screen.queryByText("Ola Medlem")).toBeNull();
  });
});
