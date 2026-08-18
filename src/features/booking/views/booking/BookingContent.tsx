import Page from "@/components/Page";
import { RecordCollectionPage } from "@/components/records";
import BookingSchedule from "./BookingSchedule";
import type { BookingContentProps } from "./bookingViewTypes";

export default function BookingContent(props: BookingContentProps) {
  const valgtGren = props.grener.find((gren) => gren.id === props.valgtGrenId);

  return (
    <Page width="lg">
      <RecordCollectionPage eyebrow="Booking" title="Book bane" description="Finn en ledig tid.">
        <BookingSchedule {...props} valgtGren={valgtGren} />
      </RecordCollectionPage>
    </Page>
  );
}
