import type { FeedbackTone } from "$lib/ui";

export type LoginFeedback = {
  description: string;
  title: string;
  tone: FeedbackTone;
};

export function validateLoginEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "E-post er påkrevd.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Ugyldig e-postadresse.";
  return null;
}

export function validateLoginOtp(value: string): string | null {
  const otp = value.trim();
  if (!otp) return "Kode er påkrevd.";
  if (!/^\d{6}$/.test(otp)) return "Koden må være 6 siffer.";
  return null;
}

export function loginFailure(
  title: string,
  error: unknown,
  fallback = "Prøv igjen om litt."
): LoginFeedback {
  return {
    description: error instanceof Error ? error.message : fallback,
    title,
    tone: "danger",
  };
}
