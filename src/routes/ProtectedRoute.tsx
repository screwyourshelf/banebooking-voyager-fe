import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;

  if (!currentUser) return <Navigate to="/" replace state={{ from: location }} />;

  return <>{children}</>;
}
