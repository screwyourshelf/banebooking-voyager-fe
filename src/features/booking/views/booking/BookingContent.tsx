import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ReglementDialog } from "@/features/booking/components";
import { resolveBookingActivityTheme } from "@/features/booking/activityTheme";
import { FeedNotice } from "@/features/feed/components";
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
        actions={
          <ReglementDialog grenId={props.valgtGrenId}>
            <Button type="button" variant="outline" size="sm">
              Se bookingregler
            </Button>
          </ReglementDialog>
        }
      />

      <FeedNotice />

      <div className="booking-workspace">
        <BookingSchedule {...props} valgtGren={valgtGren} />
      </div>
    </div>
  );
}
