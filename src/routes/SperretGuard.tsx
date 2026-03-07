import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";

export function SperretGuard() {
  const { currentUser, ready } = useAuth();
  const { bruker, laster } = useBruker();

  if (!ready) return null;
  if (!currentUser) return <Outlet />;
  if (laster) return null;
  if (bruker?.erSperret) return <Navigate to="sperret" replace />;

  return <Outlet />;
}
