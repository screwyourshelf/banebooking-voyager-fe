import { useEffect, useState } from 'react';
import { supabase } from '../supabase.js';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        let isMounted = true;

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (isMounted) setCurrentUser(user);
        });

        const {
            data: { subscription }
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
            const slug = redirectSlug || localStorage.getItem('slug') || '';
            const base = import.meta.env.BASE_URL.replace(/\/$/, '');
            const redirectTo = `${window.location.origin}${base}/${slug}`;

            await supabase.auth.signOut();
            setCurrentUser(null);

            window.location.href = redirectTo;
        }
    };
}
