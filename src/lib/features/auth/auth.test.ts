// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import LoginScreenFixture from "./LoginScreenFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false } },
};

function renderLogin(overrides: Record<string, unknown> = {}) {
  return render(LoginScreenFixture, {
    onDevelopmentLogin: vi.fn(async () => undefined),
    onLoginSuccess: vi.fn(async () => undefined),
    onOAuth: vi.fn(async () => undefined),
    onSendOtp: vi.fn(async () => undefined),
    onVerifyOtp: vi.fn(async () => undefined),
    ...overrides,
  });
}

describe("login screen", () => {
  it("sender trygt callbackmål til valgt OAuth-provider", async () => {
    const onOAuth = vi.fn(async () => undefined);
    renderLogin({ idrettensIdEnabled: true, onOAuth });

    await fireEvent.click(screen.getByRole("button", { name: "Google" }));
    expect(onOAuth).toHaveBeenCalledWith(
      "google",
      "https://app.test/auth/callback?returnTo=%2Ffjordvik%2Fminside"
    );
  });

  it("validerer e-post og fullfører sekssifret OTP-flyt", async () => {
    const onLoginSuccess = vi.fn(async () => undefined);
    const onSendOtp = vi.fn(async () => undefined);
    const onVerifyOtp = vi.fn(async () => undefined);
    renderLogin({ onLoginSuccess, onSendOtp, onVerifyOtp });

    await fireEvent.click(screen.getByRole("button", { name: "Send kode" }));
    expect(screen.getByRole("alert")).toHaveTextContent("E-post er påkrevd.");
    expect(onSendOtp).not.toHaveBeenCalled();

    await fireEvent.input(screen.getByRole("textbox", { name: "E-post" }), {
      target: { value: "kari@example.no" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Send kode" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Koden er sendt"));
    expect(onSendOtp).toHaveBeenCalledWith(
      "kari@example.no",
      "https://app.test/auth/callback?returnTo=%2Ffjordvik%2Fminside"
    );

    const otp = screen.getByRole("textbox", { name: "Skriv inn koden fra e-posten" });
    await fireEvent.input(otp, { target: { value: "12a3456" } });
    expect(otp).toHaveValue("123456");
    await fireEvent.click(screen.getByRole("button", { name: "Verifiser kode" }));

    await waitFor(() => expect(onVerifyOtp).toHaveBeenCalledWith("kari@example.no", "123456"));
    expect(onLoginSuccess).toHaveBeenCalledOnce();
  });

  it("holder utviklingsprofiler bak den eksplisitte utviklingsflaten", async () => {
    const onDevelopmentLogin = vi.fn(async () => undefined);
    renderLogin({ developmentLoginEnabled: true, onDevelopmentLogin });

    await fireEvent.click(screen.getByText("Testinnlogging"));
    await fireEvent.click(screen.getByRole("button", { name: "Klubbadministrator" }));
    expect(onDevelopmentLogin).toHaveBeenCalledWith("admin");
  });

  it("har navngitt side, skjemafelt og ingen oppdagede tilgjengelighetsbrudd", async () => {
    const view = renderLogin();
    expect(screen.getByRole("heading", { level: 1, name: "Logg inn" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "E-post" })).toHaveAttribute(
      "autocomplete",
      "email"
    );
    expect(screen.getByRole("link", { name: "vilkår" })).toHaveAttribute(
      "href",
      "/fjordvik/vilkaar"
    );
    expect((await axe.run(view.container, axeOptions)).violations).toEqual([]);
  });
});
