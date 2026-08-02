import { PageContentSkeleton } from "@/components/loading";
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
    return <PageContentSkeleton label="Laster booking" rows={5} controls />;
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
