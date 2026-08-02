import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";
import BrukerdataFeil from "./BrukerdataFeil";

export function MedlemskapGuard() {
  const { currentUser, ready } = useAuth();
  const { bruker, laster, feil, isFetching, refetch } = useBruker();

  if (!ready) return null;
  if (!currentUser) return <Outlet />;
  if (laster) return null;
  if (feil) {
    return <BrukerdataFeil feil={feil} isFetching={isFetching} onRetry={() => void refetch()} />;
  }
  if (bruker?.måBekrefteMedlemskap) return <Navigate to="bekreft-medlemskap" replace />;

  return <Outlet />;
}
