import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBooking } from "@/features/booking/hooks/useBooking";
import { useBookingSelection } from "@/features/booking/hooks/useBookingSelection";
import { useAuth } from "@/hooks/useAuth";
import { useBaner } from "@/hooks/useBaner";
import { useGrener } from "@/hooks/useGrener";
import BookingContent from "./BookingContent";

export default function BookingView() {
  const {
    grener,
    isLoading: loadingGrener,
    isFetching: fetchingGrener,
    error: grenerError,
    refetch: refetchGrener,
  } = useGrener(false);
  const {
    baner,
    isLoading: loadingBaner,
    isFetching: fetchingBaner,
    error: banerError,
    refetch: refetchBaner,
  } = useBaner(false);
  const { currentUser } = useAuth();

  const selection = useBookingSelection({ grener, baner });
  const booking = useBooking(selection.valgtDatoStr, selection.valgtBaneId);

  if (loadingBaner || loadingGrener) {
    return <BookingPageSkeleton />;
  }

  function handleSlotsRetry() {
    void booking.refetch();
  }

  function handleSetupRetry() {
    void Promise.all([refetchGrener(), refetchBaner()]);
  }

  return (
    <BookingContent
      grener={grener}
      valgtGrenId={selection.valgtGrenId}
      onGrenChange={selection.handleGrenChange}
      baner={selection.filtrerteBaner}
      valgtBaneId={selection.valgtBaneId}
      onBaneChange={selection.handleBaneChange}
      valgtDato={selection.valgtDato}
      onDatoChange={selection.handleDatoChange}
      slots={booking.slots}
      isLoading={booking.isLoading}
      isFetching={booking.isFetching}
      isSetupFetching={fetchingGrener || fetchingBaner}
      isAuthenticated={Boolean(currentUser)}
      onBook={booking.bookSlot}
      onFjern={booking.cancelBooking}
      setupFeil={grenerError?.message ?? banerError?.message ?? null}
      queryFeil={booking.error?.message ?? null}
      bookFeil={booking.bookFeil?.message ?? null}
      fjernFeil={booking.fjernFeil?.message ?? null}
      onSetupRetry={handleSetupRetry}
      onSlotsRetry={handleSlotsRetry}
    />
  );
}

function BookingPageSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10"
      aria-label="Laster booking"
    >
      <div className="space-y-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-full max-w-lg" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
