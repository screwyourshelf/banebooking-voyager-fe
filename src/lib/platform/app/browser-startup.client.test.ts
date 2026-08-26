import { describe, expect, it, vi } from "vitest";

import { completeBrowserAppStartup } from "./browser-startup.client";

describe("browser app startup", () => {
  it("annonserer at SvelteKit har overtatt oppstartsflaten", () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal("dispatchEvent", dispatchEvent);

    completeBrowserAppStartup();

    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "banebooking:app-started" })
    );
    vi.unstubAllGlobals();
  });
});
