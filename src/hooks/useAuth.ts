import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/supabase.js";
import type { User } from "@supabase/supabase-js";

function buildRedirectUrl(slug?: string) {
    const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, ""); // fjerner trailing /
    const cleanSlug = (slug ?? localStorage.getItem("slug") ?? "").replace(/^\/+|\/+$/g, "");

    // hvis ingen slug -> gå til base-root
    if (!cleanSlug) return `${window.location.origin}${base || "/"}`;

    return `${window.location.origin}${base}/${cleanSlug}`;
}

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        let alive = true;

        // init: les session uten /user-kall
        supabase.auth.getSession().then(({ data }) => {
            if (!alive) return;
            setCurrentUser(data.session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!alive) return;
            setCurrentUser(session?.user ?? null);
        });

        return () => {
            alive = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = useCallback(async (redirectSlug?: string) => {
        const redirectTo = buildRedirectUrl(redirectSlug);

        await supabase.auth.signOut();

        // Ikke sett state manuelt her – onAuthStateChange tar den.
        // Hard redirect er ok hvis dere vil “reset” hele appen etter logout.
        window.location.assign(redirectTo);
    }, []);

    return {
        currentUser,
        signOut,
    };
}
