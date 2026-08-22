<script lang="ts">
  import { resolve } from "$app/paths";
  import { getAuthContext, type DevelopmentProfile } from "$lib/platform/auth";
  import {
    AuthenticationProviderIcon,
    Button,
    Feedback,
    Form,
    FormActions,
    FormField,
    FormFields,
    FormSubmit,
    Input,
    Page,
    Section,
    SettingsStack,
  } from "$lib/ui";
  import {
    loginFailure,
    validateLoginEmail,
    validateLoginOtp,
    type LoginFeedback,
  } from "./login-model";

  type PendingAction =
    | "development-admin"
    | "development-medlem"
    | "development-utvidet"
    | "email"
    | "google"
    | "idrettens-id"
    | "otp";

  let {
    callbackUrl,
    developmentLoginEnabled = false,
    idrettensIdEnabled = false,
    onLoginSuccess,
    termsHref,
  }: {
    callbackUrl: string;
    developmentLoginEnabled?: boolean;
    idrettensIdEnabled?: boolean;
    onLoginSuccess: () => Promise<void> | void;
    termsHref: string;
  } = $props();

  const auth = getAuthContext();
  let email = $state("");
  let emailError = $state<string | null>(null);
  let feedback = $state<LoginFeedback | null>(null);
  let otp = $state("");
  let otpError = $state<string | null>(null);
  let pendingAction = $state<PendingAction | null>(null);
  let step = $state<"email" | "otp">("email");
  const busy = $derived(pendingAction !== null);

  function clearFeedback() {
    feedback = null;
  }

  async function signInWithProvider(provider: "google" | "idrettens-id") {
    if (busy) return;
    pendingAction = provider;
    clearFeedback();

    try {
      await auth.signInWithOAuth(provider, callbackUrl);
    } catch (error) {
      feedback = loginFailure("Innloggingen kunne ikke startes", error);
      pendingAction = null;
    }
  }

  async function signInAsDevelopmentProfile(profile: DevelopmentProfile) {
    if (busy) return;
    pendingAction = `development-${profile}`;
    clearFeedback();

    try {
      await auth.signInAsDevelopmentProfile(profile);
      await onLoginSuccess();
    } catch (error) {
      feedback = loginFailure("Testinnloggingen mislyktes", error);
    } finally {
      pendingAction = null;
    }
  }

  async function sendOtp(event: SubmitEvent) {
    event.preventDefault();
    if (busy) return;

    emailError = validateLoginEmail(email);
    if (emailError) return;

    pendingAction = "email";
    clearFeedback();
    try {
      const normalizedEmail = email.trim();
      await auth.sendEmailOtp(normalizedEmail, callbackUrl);
      email = normalizedEmail;
      step = "otp";
      feedback = {
        description: `Sjekk innboksen til ${normalizedEmail}.`,
        title: "Koden er sendt",
        tone: "info",
      };
    } catch (error) {
      feedback = loginFailure("Koden kunne ikke sendes", error);
    } finally {
      pendingAction = null;
    }
  }

  async function verifyOtp(event: SubmitEvent) {
    event.preventDefault();
    if (busy) return;

    otpError = validateLoginOtp(otp);
    if (otpError) return;

    pendingAction = "otp";
    clearFeedback();
    try {
      await auth.verifyEmailOtp(email, otp.trim());
      feedback = {
        description: "Du sendes tilbake til siden du ba om.",
        title: "Du er logget inn",
        tone: "success",
      };
      await onLoginSuccess();
    } catch (error) {
      feedback = loginFailure("Koden kunne ikke bekreftes", error);
    } finally {
      pendingAction = null;
    }
  }

  function normalizeOtp(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    otp = input.value.replace(/\D/g, "").slice(0, 6);
    input.value = otp;
    otpError = null;
    clearFeedback();
  }
</script>

<Page
  eyebrow="Min konto"
  title="Logg inn"
  description="Book bane og hold oversikt over tidene dine."
>
  <Section
    title="Velg innlogging"
    description="Bruk en innloggingstjeneste eller få kode på e-post."
    variant="surface"
  >
    <SettingsStack>
      <Button
        variant="secondary"
        fullWidth
        disabled={busy}
        aria-busy={pendingAction === "google" || undefined}
        onclick={() => void signInWithProvider("google")}
      >
        <AuthenticationProviderIcon provider="google" />
        {pendingAction === "google" ? "Starter Google …" : "Google"}
      </Button>

      {#if idrettensIdEnabled}
        <Button
          variant="secondary"
          fullWidth
          disabled={busy}
          aria-busy={pendingAction === "idrettens-id" || undefined}
          onclick={() => void signInWithProvider("idrettens-id")}
        >
          <AuthenticationProviderIcon provider="idrettens-id" />
          {pendingAction === "idrettens-id" ? "Starter Idrettens ID …" : "Idrettens ID"}
        </Button>
      {/if}

      {#if feedback}
        <Feedback {...feedback} />
      {/if}

      {#if step === "email"}
        <Form density="compact" pending={busy} onsubmit={sendOtp}>
          <FormFields>
            <FormField label="E-post" error={emailError} required>
              <Input
                bind:value={email}
                type="email"
                name="email"
                autocomplete="email"
                inputmode="email"
                placeholder="navn@eksempel.no"
                disabled={busy}
                oninput={() => {
                  emailError = null;
                  clearFeedback();
                }}
              />
            </FormField>
          </FormFields>
          <FormActions fullWidth>
            <FormSubmit fullWidth pending={pendingAction === "email"} pendingLabel="Sender …">
              Send kode
            </FormSubmit>
          </FormActions>
        </Form>
      {:else}
        <Form density="compact" pending={busy} onsubmit={verifyOtp}>
          <FormFields>
            <FormField
              label="Skriv inn koden fra e-posten"
              description={`Koden ble sendt til ${email}.`}
              error={otpError}
              required
            >
              <Input
                bind:value={otp}
                type="text"
                name="otp"
                autocomplete="one-time-code"
                inputmode="numeric"
                maxlength={6}
                disabled={busy}
                oninput={normalizeOtp}
              />
            </FormField>
          </FormFields>
          <FormActions fullWidth>
            <FormSubmit fullWidth pending={pendingAction === "otp"} pendingLabel="Verifiserer …">
              Verifiser kode
            </FormSubmit>
          </FormActions>
        </Form>
      {/if}

      {#if developmentLoginEnabled}
        <details>
          <summary>Testinnlogging</summary>
          <SettingsStack>
            <Button
              variant="secondary"
              fullWidth
              disabled={busy}
              onclick={() => void signInAsDevelopmentProfile("admin")}>Klubbadministrator</Button
            >
            <Button
              variant="secondary"
              fullWidth
              disabled={busy}
              onclick={() => void signInAsDevelopmentProfile("utvidet")}>Utvidet bruker</Button
            >
            <Button
              variant="secondary"
              fullWidth
              disabled={busy}
              onclick={() => void signInAsDevelopmentProfile("medlem")}>Medlem</Button
            >
          </SettingsStack>
        </details>
      {/if}

      <p>Ved å logge inn samtykker du til våre <a href={resolve(termsHref)}>vilkår</a>.</p>
    </SettingsStack>
  </Section>
</Page>
