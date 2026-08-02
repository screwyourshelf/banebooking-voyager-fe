import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSlug } from "@/hooks/useSlug";
import { buildTenantRoute } from "@/utils/tenantRoute";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, ready } = useAuth();
  const location = useLocation();
  const slug = useSlug();

  if (!ready) return null;

  if (!currentUser) {
    return <Navigate to={buildTenantRoute(slug, "login")} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
