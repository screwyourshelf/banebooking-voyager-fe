import { describe, expect, it, vi } from "vitest";
import { createObservabilityAdapter } from "./index";

describe("observability adapter", () => {
  it("filtrerer hemmelige felter og begrenser fritekst", () => {
    const reporter = {
      captureException: vi.fn(),
      captureMessage: vi.fn(),
    };
    const observability = createObservabilityAdapter(reporter);

    observability.captureMessage("Storage unavailable", {
      tenant: "askim-tennis",
      accessToken: "hemmelig",
      authorization: "Bearer hemmelig",
      detail: "x".repeat(300),
    });

    expect(reporter.captureMessage).toHaveBeenCalledWith("Storage unavailable", {
      tenant: "askim-tennis",
      detail: "x".repeat(250),
    });
  });
});
