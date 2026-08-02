import { useContext } from "react";
import { AuthContext } from "@/auth/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth må brukes innenfor AuthProvider.");
  return context;
}
