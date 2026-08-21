import BookingSchedule from "./BookingSchedule";
import type { BookingContentProps } from "./bookingViewTypes";
import { Page } from "@/components";

export default function BookingContent(props: BookingContentProps) {
  const valgtGren = props.grener.find((gren) => gren.id === props.valgtGrenId);

  return (
    <Page eyebrow="Booking" title="Book bane" description="Finn en ledig tid.">
      <BookingSchedule {...props} valgtGren={valgtGren} />
    </Page>
  );
}
