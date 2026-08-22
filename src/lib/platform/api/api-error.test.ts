import { describe, expect, it } from "vitest";
import { ApiError, pickApiErrorMessage } from "./api-error";

describe("ApiError", () => {
  it("bevarer kompatibel statuskonstruktør", () => {
    const error = new ApiError("Mangler", 404);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
    expect(error.status).toBe(404);
    expect(error.code).toBe("http_error");
  });

  it("normaliserer backendens kjente meldingsfelter", () => {
    expect(pickApiErrorMessage({ melding: "Kan ikke booke" })).toBe("Kan ikke booke");
    expect(pickApiErrorMessage({ detail: "Ugyldig dato" })).toBe("Ugyldig dato");
    expect(pickApiErrorMessage({ errors: [] })).toBeNull();
  });
});
