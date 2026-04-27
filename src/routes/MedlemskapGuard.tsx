import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";

export function MedlemskapGuard() {
  const { currentUser, ready } = useAuth();
  const { bruker, laster } = useBruker();

  if (!ready) return null;
  if (!currentUser) return <Outlet />;
  if (laster) return null;
  if (bruker?.måBekrefteMedlemskap) return <Navigate to="bekreft-medlemskap" replace />;

  return <Outlet />;
}
