import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabase.js';
import type { User } from '@supabase/supabase-js';
import LoaderSkeleton from './LoaderSkeleton.js';

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    if (loading) return <LoaderSkeleton />;
    if (!user) return <Navigate to="/" replace />;

    return <>{children}</>;
}
