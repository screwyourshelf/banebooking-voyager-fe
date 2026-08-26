// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import type { MedlemskapStatusRespons } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import AdminFixture from "./AdminFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
};

function createRequest(
  options: {
    activationFails?: boolean;
    active?: boolean;
    deactivationFails?: boolean;
    statusFails?: boolean;
  } = {}
) {
  let status: MedlemskapStatusRespons = {
    aktivBekreftelse: options.active
      ? {
          id: "membership-1",
          label: "Sesong 2026",
          opprettetTidspunkt: "2026-01-01T10:00:00Z",
          gyldigTil: "2026-12-31T00:00:00Z",
        }
      : null,
    antallBekreftet: options.active ? 12 : 0,
    antallTotalt: 42,
  };

  return vi.fn(async (path: string, requestOptions?: { method?: string; json?: unknown }) => {
    if (path.endsWith("medlemskap/status")) {
      if (options.statusFails) throw new Error("Status kunne ikke hentes.");
      return status;
    }
    if (path.endsWith("medlemskap/aktiver") && requestOptions?.method === "POST") {
      if (options.activationFails) throw new Error("Perioden finnes allerede.");
      const request = requestOptions.json as { label: string; gyldigTil: string };
      status = {
        aktivBekreftelse: {
          id: "membership-1",
          label: request.label,
          opprettetTidspunkt: "2026-08-23T10:00:00Z",
          gyldigTil: request.gyldigTil,
        },
        antallBekreftet: 0,
        antallTotalt: 42,
      };
      return status.aktivBekreftelse;
    }
    if (path.endsWith("medlemskap/aktiver") && requestOptions?.method === "DELETE") {
      if (options.deactivationFails) throw new Error("Perioden kunne ikke avsluttes.");
      status = { ...status, aktivBekreftelse: null };
      return undefined;
    }
    return undefined;
  });
}

describe("club and membership administration", () => {
  it("viser tilgjengelige lokale faner og har ingen oppdagede a11y-brudd", async () => {
    const result = render(AdminFixture, {
      request: createRequest() as ApiClient["request"],
    });

    expect(screen.getByRole("heading", { level: 1, name: "Klubbinnstillinger" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Klubbprofil" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("textbox", { name: /Klubbnavn/ })).toHaveValue("Fjordvik Tennisklubb");
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);
  });

  it("bevarer dirty-state, validerer felter og lagrer typed klubbforespørsel", async () => {
    const request = createRequest();
    render(AdminFixture, { request: request as ApiClient["request"] });
    const name = screen.getByRole("textbox", { name: /Klubbnavn/ });
    const latitude = screen.getByRole("textbox", { name: /Breddegrad/ });

    await fireEvent.input(name, { target: { value: "" } });
    expect(screen.getByText("Klubbnavn kan ikke være tomt.")).toHaveAttribute("role", "alert");
    expect(screen.getByRole("button", { name: "Lagre endringer" })).toBeDisabled();

    await fireEvent.input(name, { target: { value: "Fjordvik IL" } });
    await fireEvent.input(latitude, { target: { value: "59,25" } });
    await fireEvent.click(screen.getByRole("button", { name: "Lagre endringer" }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith("klubb/fjordvik", {
        method: "PUT",
        json: expect.objectContaining({ navn: "Fjordvik IL", latitude: 59.25 }),
      })
    );
    expect(await screen.findByText("Klubbinnstillingene er lagret")).toBeVisible();
  });

  it("validerer medlemsbekreftelsen og fokuserer første ugyldige felt", async () => {
    const request = createRequest();
    render(AdminFixture, { request: request as ApiClient["request"] });
    await fireEvent.click(screen.getByRole("tab", { name: "Medlemskap" }));

    expect(await screen.findByText("Ingen aktiv periode")).toBeVisible();
    const submit = screen.getByRole("button", { name: "Aktiver bekreftelse" });
    await fireEvent.click(submit);
    expect(screen.getByText("Skriv inn et periodenavn.")).toHaveAttribute("role", "alert");
    expect(screen.getByRole("textbox", { name: /Periodenavn/ })).toHaveFocus();
  });

  it("aktiverer medlemsbekreftelse før statusen oppfriskes", async () => {
    const request = createRequest();
    render(AdminFixture, { mode: "membership", request: request as ApiClient["request"] });
    await screen.findByText("Ingen aktiv periode");

    await fireEvent.input(screen.getByRole("textbox", { name: /Periodenavn/ }), {
      target: { value: "  Sesong 2027  " },
    });
    const dateTrigger = screen.getByRole("button", { name: "Gyldig til" });
    await fireEvent.click(dateTrigger);
    const calendar = await screen.findByLabelText(/Velg dato/i);
    await fireEvent.click(
      within(calendar).getByRole("button", { name: /søndag 23. august 2026/i })
    );
    await fireEvent.click(screen.getByRole("button", { name: "Aktiver bekreftelse" }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith("klubb/fjordvik/medlemskap/aktiver", {
        method: "POST",
        json: { label: "Sesong 2027", gyldigTil: "2026-08-23T00:00:00.000Z" },
      })
    );
    expect(await screen.findByText("Sesong 2027")).toBeVisible();
    expect(screen.getByText("0 av 42 medlemmer")).toBeVisible();
    expect(screen.getByRole("button", { name: "Deaktiver bekreftelse" })).toBeEnabled();
  });

  it("viser separate retry- og mutationfeil og skjuler utilgjengelige kontrollhandlinger", async () => {
    const statusFailure = render(AdminFixture, {
      request: createRequest({ statusFails: true }) as ApiClient["request"],
    });
    await fireEvent.click(screen.getByRole("tab", { name: "Medlemskap" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Status kunne ikke hentes.");
    expect(screen.getByRole("button", { name: "Prøv igjen" })).toBeVisible();
    statusFailure.unmount();

    render(AdminFixture, {
      capabilities: ["klubb:admin"],
      request: createRequest() as ApiClient["request"],
    });
    await fireEvent.click(screen.getByRole("tab", { name: "Medlemskap" }));
    expect(
      await screen.findByText("Du kan se medlemsstatus, men ikke endre perioden")
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Aktiver bekreftelse" })).toBeNull();
  });

  it("beholder medlemskapskonteksten ved separate aktiverings- og deaktiveringsfeil", async () => {
    const activationFailure = render(AdminFixture, {
      mode: "membership",
      request: createRequest({ activationFails: true }) as ApiClient["request"],
    });
    await screen.findByText("Ingen aktiv periode");
    await fireEvent.input(screen.getByRole("textbox", { name: /Periodenavn/ }), {
      target: { value: "Sesong 2027" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Gyldig til" }));
    const calendar = await screen.findByLabelText(/Velg dato/i);
    await fireEvent.click(
      within(calendar).getByRole("button", { name: /søndag 23. august 2026/i })
    );
    await fireEvent.click(screen.getByRole("button", { name: "Aktiver bekreftelse" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Perioden finnes allerede.");
    expect(screen.getByText("Ingen aktiv periode")).toBeVisible();
    activationFailure.unmount();

    render(AdminFixture, {
      mode: "membership",
      request: createRequest({ active: true, deactivationFails: true }) as ApiClient["request"],
    });
    expect(await screen.findByText("Sesong 2026")).toBeVisible();
    await fireEvent.click(screen.getByRole("button", { name: "Deaktiver bekreftelse" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Perioden kunne ikke avsluttes.");
    expect(screen.getByText("Sesong 2026")).toBeVisible();
  });
});
