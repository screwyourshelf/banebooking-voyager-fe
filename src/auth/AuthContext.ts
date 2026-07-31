import { createContext } from "react";
import type { AuthenticatedUser, DevelopmentProfile } from "@/auth/authTypes";

export type AuthContextValue = {
  currentUser: AuthenticatedUser | null;
  ready: boolean;
  signOut: () => Promise<void>;
  signInAsDevelopmentProfile: (profile: DevelopmentProfile) => Promise<void>;
  developmentLoginPending: DevelopmentProfile | null;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
