import { useState } from "react";
import type { ActionFeedbackMessage } from "@/components/feedback";
import { supabase } from "../supabase";

type Step = "input" | "verify";
type Status = "idle" | "sending" | "verifying" | "done" | "error";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState<ActionFeedbackMessage | null>(null);

  const erBusy = status === "sending" || status === "verifying";

  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  const redirectTo = `${window.location.origin}${base}/auth/callback`;

  const handleGoogleLogin = async () => {
    if (erBusy) return;
    setFeedback(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { access_type: "offline" },
        scopes: "openid email",
      },
    });

    if (error) {
      setFeedback({
        tone: "danger",
        title: "Innloggingen kunne ikke startes",
        description: error.message,
      });
    }
  };

  // Idrettens ID (OIDC via Buypass/NIF) — custom Supabase provider
  // provider-strengen "custom:idrettens-id" matcher provider ID i Supabase-dashboardet.
  // Supabase JS SDK støtter custom providers via provider: "custom:<id>".
  // Ref: https://supabase.com/docs/guides/auth/custom-oidc-providers
  const handleIdrettensIdLogin = async () => {
    if (erBusy) return;
    setFeedback(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "custom:idrettens-id",
      options: {
        redirectTo,
        scopes: "openid email profile",
      },
    });

    if (error) {
      setFeedback({
        tone: "danger",
        title: "Innloggingen kunne ikke startes",
        description: error.message,
      });
    }
  };

  const sendOtp = async () => {
    if (erBusy) return;

    const epost = email.trim();
    if (!epost) {
      setStatus("error");
      setFeedback({
        tone: "danger",
        title: "E-post mangler",
        description: "Skriv inn e-postadressen du vil motta koden på.",
      });
      return;
    }

    setStatus("sending");
    setFeedback(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: epost,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setStatus("error");
      setFeedback({
        tone: "danger",
        title: "Koden kunne ikke sendes",
        description: error.message,
      });
      return;
    }

    setStep("verify");
    setStatus("idle");
    setFeedback({
      tone: "info",
      title: "Koden er sendt",
      description: `Sjekk innboksen til ${epost}.`,
    });
  };

  const verifyOtp = async () => {
    if (erBusy) return;

    const epost = email.trim();
    const token = otp.trim();

    if (!epost || !token) {
      setStatus("error");
      setFeedback({
        tone: "danger",
        title: "Koden mangler",
        description: "Skriv inn den sekssifrede koden fra e-posten.",
      });
      return;
    }

    setStatus("verifying");
    setFeedback(null);

    const { error } = await supabase.auth.verifyOtp({
      email: epost,
      token,
      type: "email",
    });

    if (error) {
      setStatus("error");
      setFeedback({
        tone: "danger",
        title: "Koden kunne ikke bekreftes",
        description: error.message,
      });
      return;
    }

    setStatus("done");
    window.location.reload();
  };

  return {
    email,
    setEmail,
    otp,
    setOtp,
    feedback,
    clearFeedback: () => setFeedback(null),
    status,
    step,
    erBusy,
    handleGoogleLogin,
    handleIdrettensIdLogin,
    sendOtp,
    verifyOtp,
  };
}
