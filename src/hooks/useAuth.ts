import { useEffect, useState } from "react";
import { supabase } from "@/supabase.js";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Bruk getSession i stedet for getUser → ingen /auth/v1/user-kall
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) setCurrentUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setCurrentUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    currentUser,
    setCurrentUser,
    signOut: async (redirectSlug?: string) => {
      const slug = redirectSlug || localStorage.getItem("slug") || "";
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const redirectTo = `${window.location.origin}${base}/${slug}`;

      await supabase.auth.signOut();
      setCurrentUser(null);

      window.location.href = redirectTo;
    },
  };
}
