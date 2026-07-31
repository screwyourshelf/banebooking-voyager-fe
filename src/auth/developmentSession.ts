import type { DevelopmentLoginResponse } from "@/auth/authTypes";

const STORAGE_KEY = "banebooking_development_session";

function erGyldigSession(value: unknown): value is DevelopmentLoginResponse {
  if (!value || typeof value !== "object") return false;

  const session = value as Partial<DevelopmentLoginResponse>;
  const user = session.user as Partial<DevelopmentLoginResponse["user"]> | undefined;
  const profile = user?.developmentProfile;

  return (
    typeof session.accessToken === "string" &&
    typeof session.expiresAt === "string" &&
    Date.parse(session.expiresAt) > Date.now() &&
    typeof user?.id === "string" &&
    typeof user.email === "string" &&
    typeof user.name === "string" &&
    (profile === "admin" || profile === "utvidet" || profile === "medlem")
  );
}

export function hentUtviklingssession(): DevelopmentLoginResponse | null {
  if (!import.meta.env.DEV) return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const session: unknown = JSON.parse(raw);
    if (erGyldigSession(session)) return session;
  } catch {
    // Fjern ugyldige eller utdaterte data under.
  }

  localStorage.removeItem(STORAGE_KEY);
  return null;
}

export function lagreUtviklingssession(session: DevelopmentLoginResponse) {
  if (!import.meta.env.DEV) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function fjernUtviklingssession() {
  localStorage.removeItem(STORAGE_KEY);
}
