import type {
  AuthAdapter,
  AuthController,
  AuthSession,
  AuthState,
  AuthStateListener,
  DevelopmentProfile,
} from "./types";

const INITIAL_STATE: AuthState = { status: "initializing", user: null };

export function createAuthController(adapter: AuthAdapter): AuthController {
  let state = INITIAL_STATE;
  let initialized = false;
  let destroyed = false;
  let pendingSession: AuthSession | null | undefined;
  let initializePromise: Promise<void> | null = null;
  let signOutPromise: Promise<void> | null = null;
  const listeners = new Set<AuthStateListener>();

  const unsubscribeAdapter = adapter.subscribe((session) => {
    if (destroyed) return;
    if (!initialized) {
      pendingSession = session;
      return;
    }
    applySession(session);
  });

  function setState(nextState: AuthState) {
    state = nextState;
    listeners.forEach((listener) => listener(state));
  }

  function applySession(session: AuthSession | null) {
    setState(
      session
        ? { status: "authenticated", user: session.user }
        : { status: "anonymous", user: null }
    );
  }

  async function callAdapterMethod<TArguments extends unknown[]>(
    method: ((...args: TArguments) => Promise<void>) | undefined,
    unsupportedMessage: string,
    ...args: TArguments
  ) {
    if (!method) throw new Error(unsupportedMessage);
    await method(...args);
  }

  return {
    get state() {
      return state;
    },

    initialize() {
      if (initializePromise) return initializePromise;

      initializePromise = (async () => {
        try {
          const recoveredSession = await adapter.getSession();
          if (destroyed) return;
          initialized = true;
          applySession(pendingSession === undefined ? recoveredSession : pendingSession);
        } catch {
          if (destroyed) return;
          initialized = true;
          applySession(null);
        }
      })();

      return initializePromise;
    },

    getAccessToken() {
      return adapter.getAccessToken();
    },

    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },

    signOut() {
      if (signOutPromise) return signOutPromise;

      applySession(null);
      signOutPromise = adapter.signOut().finally(() => {
        signOutPromise = null;
      });
      return signOutPromise;
    },

    async signInAsDevelopmentProfile(profile: DevelopmentProfile) {
      if (!adapter.signInAsDevelopmentProfile) {
        throw new Error("Utviklingsinnlogging er ikke tilgjengelig.");
      }
      applySession(await adapter.signInAsDevelopmentProfile(profile));
    },

    signInWithOAuth(provider, redirectTo) {
      return callAdapterMethod(
        adapter.signInWithOAuth,
        "OAuth-innlogging er ikke tilgjengelig.",
        provider,
        redirectTo
      );
    },

    sendEmailOtp(email, redirectTo) {
      return callAdapterMethod(
        adapter.sendEmailOtp,
        "E-postinnlogging er ikke tilgjengelig.",
        email,
        redirectTo
      );
    },

    verifyEmailOtp(email, token) {
      return callAdapterMethod(
        adapter.verifyEmailOtp,
        "E-postinnlogging er ikke tilgjengelig.",
        email,
        token
      );
    },

    destroy() {
      destroyed = true;
      listeners.clear();
      unsubscribeAdapter();
      adapter.destroy?.();
    },
  };
}
