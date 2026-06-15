import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";

export function KunngjøringGuard() {
  const { currentUser, ready } = useAuth();
  const { bruker, laster } = useBruker();

  if (!ready) return null;
  if (!currentUser) return <Outlet />;
  if (laster) return null;
  if (bruker?.ulestKunngjøring) return <Navigate to="kunngjøring" replace />;

  return <Outlet />;
}
