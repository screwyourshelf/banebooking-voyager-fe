import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase.client";
import { harSupabaseToken, synkroniserSupabaseToken } from "./supabase-token.client";
import type { AuthAdapter, AuthSession, AuthSessionListener, Unsubscribe } from "./types";
import { requireSignInStorage } from "./sign-in-storage.client";

function mapUser(user: User): AuthSession["user"] {
  return {
    id: user.id,
    email: user.email ?? null,
    name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
    source: "supabase",
  };
}

function mapSession(session: Session | null): AuthSession | null {
  if (!session) return null;
  return {
    accessToken: session.access_token,
    expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined,
    user: mapUser(session.user),
  };
}

export function createSupabaseAuthAdapter(): AuthAdapter {
  let session: Session | null = null;
  let subscriptionPromise: Promise<Unsubscribe> | null = null;
  const listeners = new Set<AuthSessionListener>();

  function applySession(nextSession: Session | null) {
    session = nextSession;
    synkroniserSupabaseToken(nextSession?.access_token);
    const mapped = mapSession(nextSession);
    listeners.forEach((listener) => listener(mapped));
  }

  async function ensureSubscription() {
    subscriptionPromise ??= getSupabaseClient().then((client) => {
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, nextSession) => applySession(nextSession));
      return () => subscription.unsubscribe();
    });
    return subscriptionPromise;
  }

  async function recoverSession() {
    if (!harSupabaseToken()) return null;
    await ensureSubscription();
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    applySession(data.session);
    return mapSession(data.session);
  }

  return {
    getSession: recoverSession,

    async getAuthorization() {
      const token = session?.access_token ?? (await recoverSession())?.accessToken;
      return token ? { scheme: "Bearer", token } : null;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async signOut() {
      applySession(null);
      const client = await getSupabaseClient();
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },

    async signInWithOAuth(provider, redirectTo) {
      requireSignInStorage();
      await ensureSubscription();
      const client = await getSupabaseClient();
      const { error } = await client.auth.signInWithOAuth({
        provider: provider === "idrettens-id" ? "custom:idrettens-id" : "google",
        options: {
          redirectTo,
          scopes: provider === "idrettens-id" ? "openid email profile" : "openid email",
          queryParams: provider === "google" ? { access_type: "offline" } : undefined,
        },
      });
      if (error) throw error;
    },

    async sendEmailOtp(email, redirectTo) {
      requireSignInStorage();
      await ensureSubscription();
      const client = await getSupabaseClient();
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
      });
      if (error) throw error;
    },

    async verifyEmailOtp(email, token) {
      requireSignInStorage();
      await ensureSubscription();
      const client = await getSupabaseClient();
      const { error } = await client.auth.verifyOtp({ email, token, type: "email" });
      if (error) throw error;
    },

    destroy() {
      void subscriptionPromise?.then((unsubscribe) => unsubscribe());
      listeners.clear();
    },
  };
}
