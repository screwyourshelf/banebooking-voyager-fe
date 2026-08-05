import { lazy, type ReactNode } from "react";
import { useMatch } from "react-router-dom";
import { AppFrameSkeleton } from "@/components/loading";
import { config } from "@/config";
import { useBookingBootstrap } from "@/features/booking/hooks/useBookingBootstrap";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  children: ReactNode;
};

const BookingBootstrapError = lazy(() => import("./BookingBootstrapError"));

export default function BookingBootstrapGate({ children }: Props) {
  const { ready } = useAuth();
  const bookingMatch = useMatch({
    path: config.tenantSlug ? "/" : "/:slug",
    end: true,
  });
  const erBookingForside = Boolean(bookingMatch);
  const bootstrap = useBookingBootstrap(erBookingForside);

  if (erBookingForside && (!ready || bootstrap.isPending)) {
    return <AppFrameSkeleton />;
  }

  if (erBookingForside && bootstrap.isError) {
    return (
      <BookingBootstrapError
        error={bootstrap.error}
        isFetching={bootstrap.isFetching}
        onRetry={() => void bootstrap.refetch()}
      />
    );
  }

  return <>{children}</>;
}
