import type { AuthAdapter, AuthSession, AuthSessionListener, DevelopmentProfile } from "./types";

export function createCompositeAuthAdapter(
  development: AuthAdapter,
  supabase: AuthAdapter
): AuthAdapter {
  let source: AuthSession["user"]["source"] | null = null;
  const listeners = new Set<AuthSessionListener>();

  function notify(session: AuthSession | null) {
    source = session?.user.source ?? null;
    listeners.forEach((listener) => listener(session));
  }

  const unsubscribeDevelopment = development.subscribe((session) => {
    if (session) {
      notify(session);
      return;
    }

    if (source === "development") {
      void supabase
        .getSession()
        .then(notify)
        .catch(() => notify(null));
    }
  });
  const unsubscribeSupabase = supabase.subscribe((session) => {
    if (source !== "development") notify(session);
  });

  return {
    async getSession() {
      const developmentSession = await development.getSession();
      if (developmentSession) {
        notify(developmentSession);
        return developmentSession;
      }
      const supabaseSession = await supabase.getSession();
      notify(supabaseSession);
      return supabaseSession;
    },

    async getAccessToken() {
      return (await development.getAccessToken()) ?? supabase.getAccessToken();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async signOut() {
      source = null;
      const results = await Promise.allSettled([development.signOut(), supabase.signOut()]);
      notify(null);
      const failure = results.find(
        (result): result is PromiseRejectedResult => result.status === "rejected"
      );
      if (failure) throw failure.reason;
    },

    async signInAsDevelopmentProfile(profile: DevelopmentProfile) {
      if (!development.signInAsDevelopmentProfile) {
        throw new Error("Utviklingsinnlogging er ikke tilgjengelig.");
      }
      const session = await development.signInAsDevelopmentProfile(profile);
      await supabase.signOut().catch(() => undefined);
      notify(session);
      return session;
    },

    signInWithOAuth(provider, redirectTo) {
      if (!supabase.signInWithOAuth) throw new Error("OAuth-innlogging er ikke tilgjengelig.");
      return supabase.signInWithOAuth(provider, redirectTo);
    },

    sendEmailOtp(email, redirectTo) {
      if (!supabase.sendEmailOtp) throw new Error("E-postinnlogging er ikke tilgjengelig.");
      return supabase.sendEmailOtp(email, redirectTo);
    },

    verifyEmailOtp(email, token) {
      if (!supabase.verifyEmailOtp) throw new Error("E-postinnlogging er ikke tilgjengelig.");
      return supabase.verifyEmailOtp(email, token);
    },

    destroy() {
      unsubscribeDevelopment();
      unsubscribeSupabase();
      development.destroy?.();
      supabase.destroy?.();
    },
  };
}
