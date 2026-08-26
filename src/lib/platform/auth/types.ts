import type { ApiAuthorization } from "$lib/platform/api";

export type DevelopmentProfile = "admin" | "utvidet" | "medlem";

export const SIGN_IN_STORAGE_REQUIRED_MESSAGE =
  "Nettleseren blokkerer lokal lagring. Tillat lagring eller nettstedsdata for denne siden for å logge inn.";

type AuthenticatedUser = {
  id: string;
  email: string | null;
  name: string | null;
  source: "supabase" | "development";
  developmentProfile?: DevelopmentProfile;
};

export type DevelopmentLoginResponse = {
  accessToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    developmentProfile: DevelopmentProfile;
  };
};

export type AuthSession = {
  accessToken: string;
  expiresAt?: string;
  user: AuthenticatedUser;
};

export type AuthState =
  | { status: "initializing"; user: null }
  | { status: "anonymous"; user: null }
  | { status: "authenticated"; user: AuthenticatedUser };

export type AuthSessionListener = (session: AuthSession | null) => void;
export type AuthStateListener = (state: AuthState) => void;
export type Unsubscribe = () => void;

export type AuthAdapter = {
  getSession(): Promise<AuthSession | null>;
  getAuthorization(): Promise<ApiAuthorization | null>;
  subscribe(listener: AuthSessionListener): Unsubscribe;
  signOut(): Promise<void>;
  signInAsDevelopmentProfile?(profile: DevelopmentProfile): Promise<AuthSession>;
  signInWithOAuth?(provider: "google" | "idrettens-id", redirectTo: string): Promise<void>;
  sendEmailOtp?(email: string, redirectTo: string): Promise<void>;
  verifyEmailOtp?(email: string, token: string): Promise<void>;
  destroy?(): void;
};

export type AuthController = {
  readonly state: AuthState;
  initialize(): Promise<void>;
  getAuthorization(): Promise<ApiAuthorization | null>;
  subscribe(listener: AuthStateListener): Unsubscribe;
  signOut(): Promise<void>;
  signInAsDevelopmentProfile(profile: DevelopmentProfile): Promise<void>;
  signInWithOAuth(provider: "google" | "idrettens-id", redirectTo: string): Promise<void>;
  sendEmailOtp(email: string, redirectTo: string): Promise<void>;
  verifyEmailOtp(email: string, token: string): Promise<void>;
  destroy(): void;
};
