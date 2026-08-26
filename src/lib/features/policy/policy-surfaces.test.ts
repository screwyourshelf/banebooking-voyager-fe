// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import PolicySurfaceFixture from "./PolicySurfaceFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false } },
};

function renderFixture(
  mode: "announcement" | "blocked" | "membership",
  requestMock = vi.fn().mockResolvedValue(undefined)
) {
  const onConfirmed = vi.fn().mockResolvedValue(undefined);
  const result = render(PolicySurfaceFixture, {
    mode,
    onConfirmed,
    request: requestMock as unknown as ApiClient["request"],
  });
  return { onConfirmed, requestMock, result };
}

describe("protected policy surfaces", () => {
  it("viser sperretilstand, klubbkontakt og neste steg", () => {
    renderFixture("blocked");

    expect(screen.getByRole("heading", { level: 1, name: "Kontoen er sperret" })).toBeVisible();
    expect(screen.getByText("Sperret")).toHaveAttribute("data-ui", "page-status");
    expect(screen.getByRole("region", { name: "Kontakt klubben" })).toHaveTextContent(
      "Ta kontakt med Fjordvik Tennisklubb"
    );
    expect(screen.getByRole("link", { name: "Kontakt klubben" })).toHaveAttribute(
      "href",
      "mailto:booking@fjordvik.no"
    );
  });

  it("bekrefter den eksakte obligatoriske kunngjøringen og oppfrisker guarddata", async () => {
    const { onConfirmed, requestMock } = renderFixture("announcement");

    expect(screen.getByText("Må bekreftes")).toHaveAttribute("data-ui", "page-status");
    expect(screen.getByRole("article", { name: "Obligatorisk kunngjøring" })).toHaveTextContent(
      "Les dette nøye."
    );

    await fireEvent.click(screen.getByRole("button", { name: "Jeg har lest kunngjøringen" }));

    await waitFor(() =>
      expect(requestMock).toHaveBeenCalledWith("klubb/fjordvik/kunngjøringer/news-1/bekreft", {
        auth: "required",
        method: "POST",
      })
    );
    await waitFor(() => expect(onConfirmed).toHaveBeenCalledOnce());
  });

  it("beholder kunngjøringen og viser vedvarende mutationfeil", async () => {
    const requestMock = vi.fn().mockRejectedValue(new Error("Klubben avviste bekreftelsen."));
    const { onConfirmed } = renderFixture("announcement", requestMock);

    await fireEvent.click(screen.getByRole("button", { name: "Jeg har lest kunngjøringen" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Klubben avviste bekreftelsen.");
    expect(onConfirmed).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Jeg har lest kunngjøringen" })).toBeEnabled();
  });

  it("validerer medlemskapsutkastet og invaliderer guarddata etter gyldig bekreftelse", async () => {
    let releaseRequest: (() => void) | undefined;
    const requestMock = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          releaseRequest = resolve;
        })
    );
    const { onConfirmed, result } = renderFixture("membership", requestMock);
    expect(screen.getByRole("article", { name: "Medlemskapsbekreftelse" })).toHaveTextContent(
      "Banebooking er ikke koblet til klubbens medlemsregister"
    );
    expect(screen.getByRole("article", { name: "Medlemskapsbekreftelse" })).toHaveTextContent(
      "Hver person som logger inn, bekrefter fra sin egen konto"
    );
    const submit = screen.getByRole("button", { name: "Bekreft og fortsett" });

    await fireEvent.click(submit);
    expect(screen.getByText("Skriv inn fullt navn.")).toHaveAttribute("role", "alert");
    expect(screen.getByText("Velg medlemskapstype.")).toHaveAttribute("role", "alert");
    expect(screen.getByRole("textbox", { name: "Ditt fulle navn" })).toHaveFocus();
    expect(screen.getByRole("radiogroup", { name: "Medlemskapstype" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );

    await fireEvent.input(screen.getByRole("textbox", { name: "Ditt fulle navn" }), {
      target: { value: "  Ada Lovelace  " },
    });
    await fireEvent.click(screen.getByRole("radio", { name: "Voksen" }));
    await fireEvent.click(submit);

    await waitFor(() => expect(screen.getByRole("button", { name: "Lagrer …" })).toBeDisabled());
    expect(result.container.querySelector('[data-ui="form"]')).toHaveAttribute("aria-busy", "true");
    await waitFor(() =>
      expect(requestMock).toHaveBeenCalledWith("klubb/fjordvik/bruker/bekreft-medlemskap", {
        auth: "required",
        method: "POST",
        json: { fulltNavn: "Ada Lovelace", medlemskapType: "Voksen" },
      })
    );
    releaseRequest?.();
    await waitFor(() => expect(onConfirmed).toHaveBeenCalledOnce());
  });

  it.each(["blocked", "announcement", "membership"] as const)(
    "har ingen oppdagede tilgjengelighetsbrudd for %s-flaten",
    async (mode) => {
      const { result } = renderFixture(mode);
      expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);
    }
  );
});
