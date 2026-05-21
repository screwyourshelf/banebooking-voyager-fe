import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { config } from "@/config";
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

  useEffect(() => {
    const destination = config.tenantSlug ? "/" : `/${cleanSlug(localStorage.getItem("slug"))}`;

    let redirected = false;
    // Holdes utenfor .then() slik at cleanup-funksjonen kan nå dem
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let sub: { unsubscribe: () => void } | null = null;

    function redirect() {
      if (redirected) return;
      redirected = true;
      navigate(destination, { replace: true });
    }

    supabase.auth.getSession().then(({ data }) => {
      if (redirected) return; // komponent allerede unmountet

      // Steg 1: session klar (fragment-flow, f.eks. Google)
      if (data.session) {
        logSessionDiagnostics(data.session);
        redirect();
        return;
      }

      // Steg 2: ingen session ennå — vent på SIGNED_IN (PKCE/code-flow, f.eks. Idrettens ID)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
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

    return () => {
      // Hindrer redirect og memory-leaks ved unmount (f.eks. StrictMode double-invoke)
      redirected = true;
      if (timeout) clearTimeout(timeout);
      sub?.unsubscribe();
    };
  }, [navigate]);

  return <div className="p-4 text-center">Logger inn ...</div>;
}
