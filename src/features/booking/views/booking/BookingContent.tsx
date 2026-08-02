import { PageHeader } from "@/components/layout";
import { resolveBookingActivityTheme } from "@/features/booking/activityTheme";
import BookingSchedule from "./BookingSchedule";
import type { BookingContentProps } from "./bookingViewTypes";

export default function BookingContent(props: BookingContentProps) {
  const valgtGren = props.grener.find((gren) => gren.id === props.valgtGrenId);
  const activityTheme = resolveBookingActivityTheme(valgtGren?.slug);

  return (
    <div className="booking-page" data-activity-theme={activityTheme}>
      <PageHeader
        className="booking-page__heading"
        eyebrow="Booking"
        title="Book bane"
        description="Finn en ledig tid."
      />

      <BookingSchedule {...props} valgtGren={valgtGren} />
    </div>
  );
}
