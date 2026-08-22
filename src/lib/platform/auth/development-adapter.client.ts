import { pickApiErrorMessage } from "$lib/platform/api";
import {
  erGyldigUtviklingssession,
  fjernUtviklingssession,
  hentUtviklingssession,
  lagreUtviklingssession,
} from "./development-session.client";
import type { AuthAdapter, AuthSession, AuthSessionListener, DevelopmentProfile } from "./types";

type DevelopmentAuthAdapterOptions = {
  fetch: typeof globalThis.fetch;
  enabled?: boolean;
  endpoint?: string;
};

export function createDevelopmentAuthAdapter({
  fetch,
  enabled = import.meta.env.DEV,
  endpoint = "/api/dev-auth/login",
}: DevelopmentAuthAdapterOptions): AuthAdapter {
  let session = enabled ? hentUtviklingssession() : null;
  const listeners = new Set<AuthSessionListener>();

  function currentSession(): AuthSession | null {
    if (!session) return null;
    return {
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        source: "development",
        developmentProfile: session.user.developmentProfile,
      },
    };
  }

  function notify() {
    const value = currentSession();
    listeners.forEach((listener) => listener(value));
  }

  return {
    async getSession() {
      session = enabled ? hentUtviklingssession() : null;
      return currentSession();
    },

    async getAccessToken() {
      session = enabled ? hentUtviklingssession() : null;
      return session?.accessToken ?? null;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async signOut() {
      session = null;
      fjernUtviklingssession();
      notify();
    },

    async signInAsDevelopmentProfile(profile: DevelopmentProfile) {
      if (!enabled) throw new Error("Utviklingsinnlogging er ikke tilgjengelig.");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          pickApiErrorMessage(payload) ?? "Kunne ikke logge inn med utviklingsbrukeren."
        );
      }

      if (!erGyldigUtviklingssession(payload)) {
        throw new Error("Utviklingsserveren returnerte en ugyldig session.");
      }
      session = payload;
      lagreUtviklingssession(session);
      notify();
      return currentSession()!;
    },
  };
}
