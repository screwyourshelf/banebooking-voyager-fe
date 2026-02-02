import { useMemo, useState } from "react";
import { supabase } from "../supabase";
import { toast } from "sonner";

type Step = "input" | "verify";
type Status = "idle" | "sending" | "sent" | "verifying" | "done" | "error";

export function useLogin() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<Step>("input");
    const [status, setStatus] = useState<Status>("idle");

    const erBusy = useMemo(
        () => status === "sending" || status === "verifying",
        [status]
    );

    const redirectTo = useMemo(() => {
        const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
        return `${window.location.origin}${base}/auth/callback`;
    }, []);

    const handleGoogleLogin = async () => {
        if (erBusy) return;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo,
                queryParams: { access_type: "offline" },
                scopes: "openid email",
            },
        });

        if (error) toast.error(error.message);
    };

    const handleFacebookLogin = async () => {
        if (erBusy) return;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "facebook",
            options: {
                redirectTo,
                scopes: "email",
            },
        });

        if (error) toast.error(error.message);
    };

    const sendOtp = async () => {
        if (erBusy) return;

        const epost = email.trim();
        if (!epost) {
            setStatus("error");
            toast.error("E-post mangler");
            return;
        }

        setStatus("sending");

        const { error } = await supabase.auth.signInWithOtp({
            email: epost,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: redirectTo,
            },
        });

        if (error) {
            toast.error("Kunne ikke sende kode: " + error.message);
            setStatus("error");
            return;
        }

        toast.success("Kode sendt – sjekk e-posten din");
        setStep("verify");
        setStatus("idle");
    };

    const verifyOtp = async () => {
        if (erBusy) return;

        const epost = email.trim();
        const token = otp.trim();

        if (!epost || !token) {
            setStatus("error");
            toast.error("Mangler e-post eller kode");
            return;
        }

        setStatus("verifying");

        const { error } = await supabase.auth.verifyOtp({
            email: epost,
            token,
            type: "email",
        });

        if (error) {
            toast.error("Feil kode: " + error.message);
            setStatus("error");
            return;
        }

        toast.success("Innlogging fullført!");
        setStatus("done");
        window.location.reload();
    };

    const reset = () => {
        setEmail("");
        setOtp("");
        setStep("input");
        setStatus("idle");
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
        erBusy,
        handleGoogleLogin,
        handleFacebookLogin,
        sendOtp,
        verifyOtp,
        reset,
    };
}
