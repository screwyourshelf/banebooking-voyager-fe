import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/supabase";
import type { User } from "@supabase/supabase-js";

function buildRedirectUrl() {
    const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
    const storedSlug = (localStorage.getItem("slug") ?? "").replace(/^\/+|\/+$/g, "");

    // Hvis ingen slug -> gå til base-root
    if (!storedSlug) return `${window.location.origin}${base || "/"}`;

    return `${window.location.origin}${base}/${storedSlug}`;
}

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        let alive = true;

        supabase.auth.getSession().then(({ data }) => {
            if (!alive) return;
            setCurrentUser(data.session?.user ?? null);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!alive) return;
            setCurrentUser(session?.user ?? null);
        });

        return () => {
            alive = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = useCallback(async () => {
        const redirectTo = buildRedirectUrl();

        await supabase.auth.signOut();

        window.location.assign(redirectTo);
    }, []);

    return {
        currentUser,
        signOut,
    };
}
