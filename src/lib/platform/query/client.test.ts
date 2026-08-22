import { describe, expect, it } from "vitest";
import { ApiError } from "$lib/platform/api";
import { shouldRetryQuery } from "./client";

describe("query retry contract", () => {
  it("retryer ikke auth-, tilgangs- eller tenantfeil", () => {
    expect(shouldRetryQuery(0, new ApiError("Uautorisert", 401))).toBe(false);
    expect(shouldRetryQuery(0, new ApiError("Forbudt", 403))).toBe(false);
    expect(shouldRetryQuery(0, new ApiError("Mangler", 404))).toBe(false);
  });

  it("begrenser retrybare feil til to nye forsøk", () => {
    expect(shouldRetryQuery(0, new Error("Nettverk"))).toBe(true);
    expect(shouldRetryQuery(1, new Error("Nettverk"))).toBe(true);
    expect(shouldRetryQuery(2, new Error("Nettverk"))).toBe(false);
  });
});
