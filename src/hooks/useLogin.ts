import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';
import { toast } from 'sonner';

export function useLogin(slug?: string) {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'input' | 'verify'>('input');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'done' | 'error'>('idle');

    // Fjerner trailing slash fra BASE_URL
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const redirectTo = `${window.location.origin}${base}/auth/callback`;

    useEffect(() => {
        if (slug) {
            localStorage.setItem('slug', slug);
        }
    }, [slug]);

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                queryParams: { access_type: 'offline' },
                scopes: 'openid email',
            },
        });
        if (error) toast.error(error.message);
    };

    const handleFacebookLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo,
                scopes: 'email',
            },
        });
        if (error) toast.error(error.message);
    };

    const sendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: redirectTo,
            },
        });
        if (error) {
            toast.error('Kunne ikke sende kode: ' + error.message);
            setStatus('error');
        } else {
            toast.success('Kode sendt – sjekk e-posten din');
            setStep('verify');
            setStatus('idle');
        }
    };

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('verifying');
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        });
        if (error) {
            toast.error('Feil kode: ' + error.message);
            setStatus('error');
        } else {
            toast.success('Innlogging fullført!');
            setStatus('done');
            window.location.reload();
        }
    };

    return {
        email,
        setEmail,
        otp,
        setOtp,
        status,
        setStatus,
        step,
        setStep,
        handleGoogleLogin,
        handleFacebookLogin,
        sendOtp,
        verifyOtp,
    };
}
