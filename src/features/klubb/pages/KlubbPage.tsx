import Page from "@/components/Page";
import Tabs from "@/components/navigation/Tabs";

import KlubbInnstillingerView from "@/features/klubb/views/klubb-innstillinger/KlubbInnstillingerView";
import BookingInnstillingerView from "@/features/klubb/views/booking-innstillinger/BookingInnstillingerView";

export default function KlubbPage() {
  return (
    <Page>
      <Tabs
        defaultValue="info"
        items={[
          { value: "info", label: "Klubbinnstillinger", content: <KlubbInnstillingerView /> },
          {
            value: "booking",
            label: "Bookinginnstillinger",
            content: <BookingInnstillingerView />,
          },
        ]}
      />
    </Page>
  );
}
