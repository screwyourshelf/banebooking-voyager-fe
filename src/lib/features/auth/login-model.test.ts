import { describe, expect, it } from "vitest";
import { loginFailure, validateLoginEmail, validateLoginOtp } from "./login-model";

describe("login contract", () => {
  it("validerer e-post før authplattformen kalles", () => {
    expect(validateLoginEmail("")).toBe("E-post er påkrevd.");
    expect(validateLoginEmail("ikke-en-epost")).toBe("Ugyldig e-postadresse.");
    expect(validateLoginEmail(" kari@example.no ")).toBeNull();
  });

  it("krever nøyaktig seks sifre i e-postkoden", () => {
    expect(validateLoginOtp("")).toBe("Kode er påkrevd.");
    expect(validateLoginOtp("12345")).toBe("Koden må være 6 siffer.");
    expect(validateLoginOtp("123456")).toBeNull();
  });

  it("normaliserer authfeil uten å miste en trygg fallback", () => {
    expect(loginFailure("Kunne ikke logge inn", new Error("Auth er nede"))).toEqual({
      description: "Auth er nede",
      title: "Kunne ikke logge inn",
      tone: "danger",
    });
    expect(loginFailure("Kunne ikke logge inn", null).description).toBe("Prøv igjen om litt.");
  });
});
