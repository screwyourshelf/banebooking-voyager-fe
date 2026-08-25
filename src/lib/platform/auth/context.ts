import { createContext } from "svelte";
import type { AuthController } from "./types";

export type AuthContextValue = Pick<
  AuthController,
  | "sendEmailOtp"
  | "signInAsDevelopmentProfile"
  | "signInWithOAuth"
  | "signOut"
  | "state"
  | "verifyEmailOtp"
>;

export const [getAuthContext, setAuthContext] = createContext<AuthContextValue>();
