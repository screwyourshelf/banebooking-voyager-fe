import { describe, expect, it, vi } from "vitest";
import { createAuthController } from "./controller";
import type { AuthAdapter, AuthSession, AuthSessionListener } from "./types";

const session: AuthSession = {
  accessToken: "token",
  user: { id: "user-1", email: "a@example.no", name: "Ada", source: "supabase" },
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function createAdapter(getSession: AuthAdapter["getSession"]) {
  let listener: AuthSessionListener = () => {};
  const adapter: AuthAdapter = {
    getSession,
    getAuthorization: async () => ({ scheme: "Bearer", token: session.accessToken }),
    subscribe(nextListener) {
      listener = nextListener;
      return () => {};
    },
    signOut: vi.fn(async () => {}),
  };
  return { adapter, emit: (value: AuthSession | null) => listener(value) };
}

describe("auth controller", () => {
  it("forblir initializing og bruker siste sessionevent under hard refresh", async () => {
    const recovery = deferred<AuthSession | null>();
    const { adapter, emit } = createAdapter(() => recovery.promise);
    const controller = createAuthController(adapter);

    const initialization = controller.initialize();
    emit(session);
    expect(controller.state.status).toBe("initializing");

    recovery.resolve(null);
    await initialization;
    expect(controller.state).toEqual({ status: "authenticated", user: session.user });
  });

  it("går deterministisk til anonymous når recovery feiler", async () => {
    const { adapter } = createAdapter(async () => Promise.reject(new Error("storage feilet")));
    const controller = createAuthController(adapter);

    await controller.initialize();
    expect(controller.state).toEqual({ status: "anonymous", user: null });
  });

  it("slår sammen samtidig utlogging", async () => {
    const signOut = deferred<void>();
    const { adapter } = createAdapter(async () => session);
    adapter.signOut = vi.fn(() => signOut.promise);
    const controller = createAuthController(adapter);
    await controller.initialize();

    const first = controller.signOut();
    const second = controller.signOut();
    expect(adapter.signOut).toHaveBeenCalledTimes(1);
    expect(controller.state.status).toBe("anonymous");
    signOut.resolve();
    await Promise.all([first, second]);
  });
});
