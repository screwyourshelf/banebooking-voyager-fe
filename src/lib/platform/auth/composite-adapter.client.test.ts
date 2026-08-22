import { describe, expect, it, vi } from "vitest";
import { createCompositeAuthAdapter } from "./composite-adapter.client";
import type { AuthAdapter, AuthSession, AuthSessionListener } from "./types";

const developmentSession: AuthSession = {
  accessToken: "development-token",
  user: {
    id: "dev-1",
    email: "dev@example.no",
    name: "Utvikler",
    source: "development",
    developmentProfile: "admin",
  },
};

const supabaseSession: AuthSession = {
  accessToken: "supabase-token",
  user: { id: "user-1", email: "a@example.no", name: "Ada", source: "supabase" },
};

function createAdapter(initialSession: AuthSession | null) {
  let session = initialSession;
  const listeners = new Set<AuthSessionListener>();
  const adapter: AuthAdapter = {
    getSession: vi.fn(async () => session),
    getAccessToken: vi.fn(async () => session?.accessToken ?? null),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    signOut: vi.fn(async () => {
      session = null;
      listeners.forEach((listener) => listener(null));
    }),
  };

  return {
    adapter,
    emit(nextSession: AuthSession | null) {
      session = nextSession;
      listeners.forEach((listener) => listener(nextSession));
    },
  };
}

describe("composite auth adapter", () => {
  it("prioriterer utviklingssession og faller tilbake til Supabase når den fjernes", async () => {
    const development = createAdapter(developmentSession);
    const supabase = createAdapter(supabaseSession);
    const composite = createCompositeAuthAdapter(development.adapter, supabase.adapter);
    const listener = vi.fn();
    composite.subscribe(listener);

    await expect(composite.getSession()).resolves.toBe(developmentSession);
    expect(supabase.adapter.getSession).not.toHaveBeenCalled();

    development.emit(null);
    await vi.waitFor(() => expect(listener).toHaveBeenLastCalledWith(supabaseSession));
  });

  it("logger ut begge adapters og publiserer anonym session", async () => {
    const development = createAdapter(developmentSession);
    const supabase = createAdapter(supabaseSession);
    const composite = createCompositeAuthAdapter(development.adapter, supabase.adapter);
    const listener = vi.fn();
    composite.subscribe(listener);
    await composite.getSession();

    await composite.signOut();

    expect(development.adapter.signOut).toHaveBeenCalledOnce();
    expect(supabase.adapter.signOut).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenLastCalledWith(null);
  });
});
