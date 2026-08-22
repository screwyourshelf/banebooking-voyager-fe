import { describe, expect, it } from "vitest";
import { erGyldigUtviklingssession } from "./development-session.client";

describe("utviklingssession", () => {
  const now = Date.parse("2026-08-22T12:00:00Z");

  it("godtar bare komplette, fremtidige sessions med kjent profil", () => {
    const valid = {
      accessToken: "token",
      expiresAt: "2026-08-22T13:00:00Z",
      user: {
        id: "user-1",
        email: "admin@example.no",
        name: "Admin",
        developmentProfile: "admin",
      },
    };

    expect(erGyldigUtviklingssession(valid, now)).toBe(true);
    expect(erGyldigUtviklingssession({ ...valid, expiresAt: "2026-08-22T11:00:00Z" }, now)).toBe(
      false
    );
    expect(
      erGyldigUtviklingssession(
        { ...valid, user: { ...valid.user, developmentProfile: "ukjent" } },
        now
      )
    ).toBe(false);
  });
});
