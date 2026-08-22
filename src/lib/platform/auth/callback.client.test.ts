import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSupabaseClient: vi.fn(),
  synkroniserSupabaseToken: vi.fn(),
}));

vi.mock("./supabase.client", () => ({ getSupabaseClient: mocks.getSupabaseClient }));
vi.mock("./supabase-token.client", () => ({
  synkroniserSupabaseToken: mocks.synkroniserSupabaseToken,
}));

import { completeAuthCallback } from "./callback.client";

const session = { access_token: "callback-token" } as Session;

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("auth callback", () => {
  it("fullfører umiddelbart når Supabase allerede har etablert session", async () => {
    mocks.getSupabaseClient.mockResolvedValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      },
    });

    await expect(completeAuthCallback()).resolves.toBe(true);
    expect(mocks.synkroniserSupabaseToken).toHaveBeenCalledWith("callback-token");
  });

  it("venter på et innloggingsevent og rydder subscription", async () => {
    let authListener!: (event: AuthChangeEvent, session: Session | null) => void;
    const unsubscribe = vi.fn();
    mocks.getSupabaseClient.mockResolvedValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn((listener) => {
          authListener = listener;
          return { data: { subscription: { unsubscribe } } };
        }),
      },
    });

    const completion = completeAuthCallback();
    await vi.waitFor(() => expect(authListener).toBeTypeOf("function"));
    authListener("SIGNED_IN", session);

    await expect(completion).resolves.toBe(true);
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(mocks.synkroniserSupabaseToken).toHaveBeenCalledWith("callback-token");
  });

  it("avslutter deterministisk uten session etter timeout", async () => {
    vi.useFakeTimers();
    const unsubscribe = vi.fn();
    mocks.getSupabaseClient.mockResolvedValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe } } })),
      },
    });

    const completion = completeAuthCallback(50);
    await vi.advanceTimersByTimeAsync(50);

    await expect(completion).resolves.toBe(false);
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(mocks.synkroniserSupabaseToken).toHaveBeenCalledWith(undefined);
  });
});
