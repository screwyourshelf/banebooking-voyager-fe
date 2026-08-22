import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ErrorShell from "@/app/ErrorShell";
import {
  LOKAL_LAGRING_KREVES_FOR_INNLOGGING,
  synkroniserSupabaseToken,
} from "@/auth/supabaseToken";
import { ErrorDisplay } from "@/components/errors/ErrorDisplay";
import { config } from "@/config";
import { getSupabaseClient } from "@/supabase";
import { lesLokalLagring, lokalLagringErTilgjengelig } from "@/utils/browserStorage";
import type { Session } from "@supabase/supabase-js";

function cleanSlug(raw: string | null): string {
  const s = (raw ?? "").trim();
  const noHashQuery = s.split("#")[0].split("?")[0];
  const trimmed = noHashQuery.replace(/^\/+|\/+$/g, "");
  return trimmed || config.defaultSlug;
}

function logSessionDiagnostics(session: Session | null) {
  if (!import.meta.env.DEV) return;
  if (!session?.user) {
    console.warn("[AuthCallback] Ingen session etablert");
    return;
  }
  const u = session.user;
  console.group("[AuthCallback] Session etablert");
  console.log("id / sub:      ", u.id);
  console.log("email:         ", u.email);
  console.log("provider:      ", u.app_metadata?.provider);
  console.log("providers:     ", u.app_metadata?.providers);
  console.log("identities:    ", u.identities);
  console.log("user_metadata: ", u.user_metadata);
  console.log("app_metadata:  ", u.app_metadata);
  console.groupEnd();
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [kanLagreSession] = useState(lokalLagringErTilgjengelig);

  useEffect(() => {
    if (!kanLagreSession) return;

    const destination = config.tenantSlug ? "/" : `/${cleanSlug(lesLokalLagring("slug"))}`;

    let redirected = false;
    // Holdes utenfor .then() slik at cleanup-funksjonen kan nå dem
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let sub: { unsubscribe: () => void } | null = null;

    function redirect() {
      if (redirected) return;
      redirected = true;
      navigate(destination, { replace: true });
    }

    void getSupabaseClient().then((supabase) => {
      void supabase.auth.getSession().then(({ data }) => {
        if (redirected) return; // komponent allerede unmountet

        // Steg 1: session klar (fragment-flow, f.eks. Google)
        if (data.session) {
          synkroniserSupabaseToken(data.session.access_token);
          logSessionDiagnostics(data.session);
          redirect();
          return;
        }

        // Steg 2: ingen session ennå — vent på SIGNED_IN (PKCE/code-flow, f.eks. Idrettens ID)
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
            synkroniserSupabaseToken(session?.access_token);
            logSessionDiagnostics(session);
            subscription.unsubscribe();
            redirect();
          }
        });
        sub = subscription;

        // Steg 3: sikkerhetsnett — redirect etter 5 sek uansett
        timeout = setTimeout(() => {
          console.warn("[AuthCallback] Timeout — redirect uten bekreftet session");
          redirect();
        }, 5000);
      });
    });

    return () => {
      // Hindrer redirect og memory-leaks ved unmount (f.eks. StrictMode double-invoke)
      redirected = true;
      if (timeout) clearTimeout(timeout);
      sub?.unsubscribe();
    };
  }, [kanLagreSession, navigate]);

  if (!kanLagreSession) {
    return (
      <ErrorShell>
        <ErrorDisplay
          icon={ShieldAlert}
          title="Kan ikke fullføre innloggingen"
          description={LOKAL_LAGRING_KREVES_FOR_INNLOGGING}
        />
      </ErrorShell>
    );
  }

  return (
    <div data-ui="auth-status" role="status">
      Logger inn ...
    </div>
  );
}
