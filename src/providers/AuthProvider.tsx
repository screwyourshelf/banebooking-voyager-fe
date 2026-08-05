import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/auth/AuthContext";
import type {
  AuthenticatedUser,
  DevelopmentLoginResponse,
  DevelopmentProfile,
} from "@/auth/authTypes";
import { hentUtviklingssession, lagreUtviklingssession } from "@/auth/developmentSession";
import { harSupabaseToken, synkroniserSupabaseToken } from "@/auth/supabaseToken";
import { getSupabaseClient, onSupabaseClientAvailable } from "@/supabase";
import { signOutAndRedirect } from "@/utils/authUtils";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

function fraSupabase(user: User | null): AuthenticatedUser | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
    source: "supabase",
  };
}

function fraUtviklingssession(session: DevelopmentLoginResponse): AuthenticatedUser {
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    source: "development",
    developmentProfile: session.user.developmentProfile,
  };
}

async function lesFeilmelding(response: Response) {
  try {
    const data = (await response.json()) as { melding?: unknown; message?: unknown };
    if (typeof data.melding === "string") return data.melding;
    if (typeof data.message === "string") return data.message;
  } catch {
    // Bruk standardmeldingen under.
  }

  return "Kunne ikke logge inn med utviklingsbrukeren.";
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [initialDevelopmentSession] = useState(hentUtviklingssession);
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() =>
    initialDevelopmentSession ? fraUtviklingssession(initialDevelopmentSession) : null
  );
  const [ready, setReady] = useState(
    () => Boolean(initialDevelopmentSession) || !harSupabaseToken()
  );
  const [developmentLoginPending, setDevelopmentLoginPending] = useState<DevelopmentProfile | null>(
    null
  );

  useEffect(() => {
    let alive = true;
    let started = false;
    let authSubscription: { unsubscribe: () => void } | null = null;

    function applySession(session: Session | null) {
      if (!alive) return;

      const localSession = hentUtviklingssession();
      if (localSession) {
        synkroniserSupabaseToken();
        setCurrentUser(fraUtviklingssession(localSession));
      } else {
        synkroniserSupabaseToken(session?.access_token);
        setCurrentUser(fraSupabase(session?.user ?? null));
      }
      setReady(true);
    }

    async function recoverSession(availableClient?: SupabaseClient) {
      if (started) return;
      started = true;

      try {
        const supabase = availableClient ?? (await getSupabaseClient());
        if (!alive) return;

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => applySession(session));
        authSubscription = subscription;

        const { data } = await supabase.auth.getSession();
        applySession(data.session);
      } catch {
        if (!alive) return;
        synkroniserSupabaseToken();
        setCurrentUser(null);
        setReady(true);
      }
    }

    const stopListeningForClient = onSupabaseClientAvailable((availableClient) => {
      void recoverSession(availableClient);
    });

    // En speilet token betyr at brukeren kan ha en aktiv Supabase-sesjon.
    // Uten token er appen klar som anonym med en gang og SDK-en lastes ikke.
    if (!hentUtviklingssession() && harSupabaseToken()) {
      void recoverSession();
    }

    return () => {
      alive = false;
      stopListeningForClient();
      authSubscription?.unsubscribe();
    };
  }, []);

  const signInAsDevelopmentProfile = useCallback(
    async (profile: DevelopmentProfile) => {
      if (!import.meta.env.DEV || developmentLoginPending) return;

      setDevelopmentLoginPending(profile);
      try {
        const response = await fetch("/api/dev-auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile }),
        });

        if (!response.ok) throw new Error(await lesFeilmelding(response));

        const session = (await response.json()) as DevelopmentLoginResponse;
        lagreUtviklingssession(session);
        synkroniserSupabaseToken();
        queryClient.clear();
        setCurrentUser(fraUtviklingssession(session));
        setReady(true);

        const supabase = await getSupabaseClient();
        await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      } catch (error) {
        throw error instanceof Error ? error : new Error("Kunne ikke logge inn.");
      } finally {
        setDevelopmentLoginPending(null);
      }
    },
    [developmentLoginPending, queryClient]
  );

  const signOut = useCallback(async () => {
    queryClient.clear();
    setCurrentUser(null);
    await signOutAndRedirect();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        ready,
        signOut,
        signInAsDevelopmentProfile,
        developmentLoginPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
