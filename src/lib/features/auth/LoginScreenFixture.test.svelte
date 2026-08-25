<script lang="ts">
  import { setAuthContext, type AuthContextValue } from "$lib/platform/auth";
  import LoginScreen from "./LoginScreen.svelte";

  let {
    developmentLoginEnabled = false,
    idrettensIdEnabled = false,
    onDevelopmentLogin,
    onLoginSuccess,
    onOAuth,
    onSendOtp,
    onVerifyOtp,
  }: {
    developmentLoginEnabled?: boolean;
    idrettensIdEnabled?: boolean;
    onDevelopmentLogin: AuthContextValue["signInAsDevelopmentProfile"];
    onLoginSuccess: () => Promise<void> | void;
    onOAuth: AuthContextValue["signInWithOAuth"];
    onSendOtp: AuthContextValue["sendEmailOtp"];
    onVerifyOtp: AuthContextValue["verifyEmailOtp"];
  } = $props();

  setAuthContext({
    sendEmailOtp: (...args) => onSendOtp(...args),
    signInAsDevelopmentProfile: (...args) => onDevelopmentLogin(...args),
    signInWithOAuth: (...args) => onOAuth(...args),
    signOut: async () => undefined,
    state: { status: "anonymous", user: null },
    verifyEmailOtp: (...args) => onVerifyOtp(...args),
  });
</script>

<LoginScreen
  callbackUrl="https://app.test/auth/callback?returnTo=%2Ffjordvik%2Fminside"
  {developmentLoginEnabled}
  {idrettensIdEnabled}
  {onLoginSuccess}
  termsHref="/fjordvik/vilkaar"
/>
