import type { DevelopmentLoginResponse } from "./types";
import {
  fjernFraLokalLagring,
  lesLokalLagring,
  skrivLokalLagring,
} from "$lib/platform/storage/browser-storage.client";

const STORAGE_KEY = "banebooking_development_session";

export function erGyldigUtviklingssession(
  value: unknown,
  now = Date.now()
): value is DevelopmentLoginResponse {
  if (!value || typeof value !== "object") return false;

  const session = value as Partial<DevelopmentLoginResponse>;
  const user = session.user as Partial<DevelopmentLoginResponse["user"]> | undefined;
  const profile = user?.developmentProfile;

  return (
    typeof session.accessToken === "string" &&
    typeof session.expiresAt === "string" &&
    Date.parse(session.expiresAt) > now &&
    typeof user?.id === "string" &&
    typeof user.email === "string" &&
    typeof user.name === "string" &&
    (profile === "admin" || profile === "utvidet" || profile === "medlem")
  );
}

export function hentUtviklingssession(): DevelopmentLoginResponse | null {
  if (!import.meta.env.DEV) return null;

  const raw = lesLokalLagring(STORAGE_KEY);
  if (!raw) return null;

  try {
    const session: unknown = JSON.parse(raw);
    if (erGyldigUtviklingssession(session)) return session;
  } catch {
    // Fjern ugyldige eller utdaterte data under.
  }

  fjernFraLokalLagring(STORAGE_KEY);
  return null;
}

export function lagreUtviklingssession(session: DevelopmentLoginResponse) {
  if (!import.meta.env.DEV) return;
  skrivLokalLagring(STORAGE_KEY, JSON.stringify(session));
}

export function fjernUtviklingssession() {
  fjernFraLokalLagring(STORAGE_KEY);
}
