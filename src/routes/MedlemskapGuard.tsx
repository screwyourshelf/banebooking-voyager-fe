import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";
import { RouteContentSkeleton } from "@/components/loading";
import BrukerdataFeil from "./LazyBrukerdataFeil";

export function MedlemskapGuard() {
  const { currentUser, ready } = useAuth();
  const { bruker, laster, feil, isFetching, refetch } = useBruker();

  if (!ready) return <RouteContentSkeleton label="Kontrollerer innlogging" />;
  if (!currentUser) return <Outlet />;
  if (laster) return <RouteContentSkeleton label="Kontrollerer medlemskap" />;
  if (feil) {
    return <BrukerdataFeil feil={feil} isFetching={isFetching} onRetry={() => void refetch()} />;
  }
  if (bruker?.måBekrefteMedlemskap) return <Navigate to="bekreft-medlemskap" replace />;

  return <Outlet />;
}
