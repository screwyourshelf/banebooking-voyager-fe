// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

const runtimeImport = vi.hoisted(() => ({
  attempted: vi.fn(),
  error: new TypeError("Importing a module script failed."),
}));
const observability = vi.hoisted(() => ({
  captureException: vi.fn(),
}));

vi.mock("$app/environment", () => ({
  browser: true,
  building: false,
  dev: false,
  version: "test",
}));
vi.mock("./browser-runtime.client", () => {
  runtimeImport.attempted();
  throw runtimeImport.error;
});
vi.mock("./browser-startup.client", () => ({
  getBrowserObservability: () => ({
    captureException: observability.captureException,
    captureMessage: vi.fn(),
  }),
}));

import AppProvidersFixture from "./AppProvidersFixture.test.svelte";

afterEach(() => {
  document.documentElement.removeAttribute("data-banebooking-asset-recovery");
  vi.clearAllMocks();
});

describe("AppProviders", () => {
  it("rapporterer ikke en runtime-import som asset-recoveryen allerede håndterer", async () => {
    document.documentElement.setAttribute("data-banebooking-asset-recovery", "true");

    render(AppProvidersFixture);

    expect(screen.getByText("Appinnhold")).toBeInTheDocument();
    await vi.waitFor(() => expect(runtimeImport.attempted).toHaveBeenCalledOnce());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(observability.captureException).not.toHaveBeenCalled();
  });
});
