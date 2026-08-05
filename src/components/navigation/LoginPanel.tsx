import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, KeyRound, Mail, ShieldCheck, UserRound, UserRoundCog } from "lucide-react";

import ActionFeedback, { type ActionFeedbackMessage } from "@/components/feedback/ActionFeedback";
import { FormActions, FormLayout, FormSubmitButton } from "@/components/forms";
import { GoogleIcon, IdrettensIdIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { config } from "@/config";
import { useAuth } from "@/hooks/useAuth";
import { useLogin } from "@/hooks/useLogin";
import { useSlug } from "@/hooks/useSlug";
import { buildTenantRoute } from "@/utils/tenantRoute";

function erGyldigEpost(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

type LoginPanelProps = {
  onLoginSuccess?: () => void;
  showIntro?: boolean;
};

export default function LoginPanel({ onLoginSuccess, showIntro = true }: LoginPanelProps) {
  const slug = useSlug();
  const { signInAsDevelopmentProfile, developmentLoginPending } = useAuth();
  const {
    email,
    setEmail,
    otp,
    setOtp,
    feedback,
    clearFeedback,
    status,
    step,
    erBusy,
    handleGoogleLogin,
    handleIdrettensIdLogin,
    sendOtp,
    verifyOtp,
  } = useLogin();
  const [feilEmail, setFeilEmail] = useState<string | null>(null);
  const [feilOtp, setFeilOtp] = useState<string | null>(null);
  const [developmentFeedback, setDevelopmentFeedback] = useState<ActionFeedbackMessage | null>(
    null
  );

  const [prevStep, setPrevStep] = useState(step);
  if (step !== prevStep) {
    setPrevStep(step);
    setFeilEmail(null);
    setFeilOtp(null);
  }

  const stoppPanelKeybindings = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1) e.stopPropagation();
  };

  const emailInputProps = useMemo(
    () => ({
      type: "text" as const,
      inputMode: "email" as const,
      autoComplete: "email" as const,
      onKeyDown: stoppPanelKeybindings,
    }),
    []
  );

  const otpInputProps = useMemo(
    () => ({
      type: "text" as const,
      inputMode: "numeric" as const,
      autoComplete: "one-time-code" as const,
      maxLength: 6,
      onKeyDown: stoppPanelKeybindings,
    }),
    []
  );

  function submitSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();

    if (!value) return setFeilEmail("E-post er påkrevd.");
    if (!erGyldigEpost(value)) return setFeilEmail("Ugyldig e-postadresse.");

    setFeilEmail(null);
    setDevelopmentFeedback(null);
    clearFeedback();
    void sendOtp();
  }

  function submitVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const value = otp.trim();

    if (!value) return setFeilOtp("Kode er påkrevd.");
    if (!/^\d{6}$/.test(value)) return setFeilOtp("Koden må være 6 siffer.");

    setFeilOtp(null);
    setDevelopmentFeedback(null);
    clearFeedback();
    void verifyOtp();
  }

  const busy = erBusy || !!developmentLoginPending;

  async function loggInnSomUtviklingsprofil(profil: "admin" | "utvidet" | "medlem") {
    setDevelopmentFeedback(null);
    clearFeedback();

    try {
      await signInAsDevelopmentProfile(profil);
      onLoginSuccess?.();
    } catch (error) {
      setDevelopmentFeedback({
        tone: "danger",
        title: "Testinnloggingen mislyktes",
        description: error instanceof Error ? error.message : "Prøv igjen om litt.",
      });
    }
  }

  const visibleFeedback = developmentFeedback ?? feedback;

  return (
    <div className="login-panel">
      {showIntro ? (
        <div className="login-panel__intro">
          <strong>Logg inn</strong>
          <span>Book bane og hold oversikt over tidene dine.</span>
        </div>
      ) : null}

      <div className="login-panel__providers">
        <Button
          variant="outline"
          onClick={() => {
            setDevelopmentFeedback(null);
            void handleGoogleLogin();
          }}
          disabled={busy}
          aria-label="Logg inn med Google"
        >
          <GoogleIcon className="size-5" />
          Google
        </Button>

        {config.enableIdrettensId ? (
          <Button
            variant="outline"
            onClick={() => {
              setDevelopmentFeedback(null);
              void handleIdrettensIdLogin();
            }}
            disabled={busy}
            aria-label="Logg inn med Idrettens ID"
          >
            <IdrettensIdIcon className="size-5" />
            Idrettens ID
          </Button>
        ) : null}
      </div>

      <div className="login-panel__divider">
        <span>eller</span>
      </div>

      {visibleFeedback ? <ActionFeedback {...visibleFeedback} /> : null}

      {step === "input" ? (
        <FormLayout density="compact" className="login-panel__form" onSubmit={submitSendOtp}>
          <div className="login-panel__form-heading">
            <Mail aria-hidden="true" />
            <label htmlFor="email">E-post</label>
          </div>

          <Field data-invalid={!!feilEmail}>
            <Input
              id="email"
              value={email}
              placeholder="navn@eksempel.no"
              onChange={(e) => {
                setEmail(e.target.value);
                if (feilEmail) setFeilEmail(null);
                if (feedback) clearFeedback();
                if (developmentFeedback) setDevelopmentFeedback(null);
              }}
              aria-invalid={!!feilEmail}
              {...emailInputProps}
            />
            {feilEmail ? <FieldError>{feilEmail}</FieldError> : null}
          </Field>

          <FormActions align="left" spaced={false} className="w-full">
            <FormSubmitButton fullWidth isLoading={status === "sending"} loadingText="Sender...">
              Send kode
            </FormSubmitButton>
          </FormActions>
        </FormLayout>
      ) : (
        <FormLayout density="compact" className="login-panel__form" onSubmit={submitVerifyOtp}>
          <div className="login-panel__form-heading">
            <Mail aria-hidden="true" />
            <span>Skriv inn koden fra e-posten</span>
          </div>

          <Field data-invalid={!!feilOtp}>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                if (feilOtp) setFeilOtp(null);
                if (feedback) clearFeedback();
                if (developmentFeedback) setDevelopmentFeedback(null);
              }}
              aria-invalid={!!feilOtp}
              {...otpInputProps}
            />
            {feilOtp ? <FieldError>{feilOtp}</FieldError> : null}
          </Field>

          <FormActions align="left" spaced={false} className="w-full">
            <FormSubmitButton
              fullWidth
              isLoading={status === "verifying"}
              loadingText="Verifiserer..."
            >
              Verifiser kode
            </FormSubmitButton>
          </FormActions>
        </FormLayout>
      )}

      {import.meta.env.DEV ? (
        <details className="login-panel__development">
          <summary>
            <KeyRound aria-hidden="true" />
            <span>
              <strong>Testinnlogging</strong>
              <small>Velg en ferdig rolle i POC-en</small>
            </span>
            <ChevronDown className="login-panel__development-chevron" aria-hidden="true" />
          </summary>

          <div className="login-panel__development-actions">
            <button
              type="button"
              className="login-panel__action"
              aria-label="Logg inn som klubbadministrator"
              onClick={() => void loggInnSomUtviklingsprofil("admin")}
              disabled={busy}
            >
              <ShieldCheck aria-hidden="true" />
              <strong>Klubbadministrator</strong>
            </button>

            <button
              type="button"
              className="login-panel__action"
              aria-label="Logg inn som utvidet bruker"
              onClick={() => void loggInnSomUtviklingsprofil("utvidet")}
              disabled={busy}
            >
              <UserRoundCog aria-hidden="true" />
              <strong>Utvidet bruker</strong>
            </button>

            <button
              type="button"
              className="login-panel__action"
              aria-label="Logg inn som medlem"
              onClick={() => void loggInnSomUtviklingsprofil("medlem")}
              disabled={busy}
            >
              <UserRound aria-hidden="true" />
              <strong>Medlem</strong>
            </button>
          </div>
        </details>
      ) : null}

      <p className="login-panel__terms">
        Ved å logge inn samtykker du til våre{" "}
        <Link to={buildTenantRoute(slug, "vilkaar")}>vilkår</Link>.
      </p>
    </div>
  );
}
