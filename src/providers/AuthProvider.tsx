import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthContext } from "@/auth/AuthContext";
import type {
  AuthenticatedUser,
  DevelopmentLoginResponse,
  DevelopmentProfile,
} from "@/auth/authTypes";
import { hentUtviklingssession, lagreUtviklingssession } from "@/auth/developmentSession";
import { supabase } from "@/supabase";
import { signOutAndRedirect } from "@/utils/authUtils";
import type { User } from "@supabase/supabase-js";

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
  const [ready, setReady] = useState(() => !!initialDevelopmentSession);
  const [developmentLoginPending, setDevelopmentLoginPending] = useState<DevelopmentProfile | null>(
    null
  );

  useEffect(() => {
    let alive = true;

    if (!hentUtviklingssession()) {
      void supabase.auth.getSession().then(({ data }) => {
        if (!alive || hentUtviklingssession()) return;
        setCurrentUser(fraSupabase(data.session?.user ?? null));
        setReady(true);
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;

      const localSession = hentUtviklingssession();
      if (localSession) {
        setCurrentUser(fraUtviklingssession(localSession));
      } else {
        setCurrentUser(fraSupabase(session?.user ?? null));
      }
      setReady(true);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
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
        localStorage.removeItem("supabase_token");
        queryClient.clear();
        setCurrentUser(fraUtviklingssession(session));
        setReady(true);

        await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
        toast.success(`Innlogget som ${session.user.name}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Kunne ikke logge inn.");
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
