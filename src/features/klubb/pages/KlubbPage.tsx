import { useState } from "react";

import Page from "@/components/Page";
import { TabsLazyMount } from "@/components/navigation";

import KlubbInnstillingerView from "@/features/klubb/views/klubb-innstillinger/KlubbInnstillingerView";
import BookingInnstillingerView from "@/features/klubb/views/booking-innstillinger/BookingInnstillingerView";

export default function KlubbPage() {
    const [tab, setTab] = useState("info");

    return (
        <Page>
            <TabsLazyMount
                items={[
                    { value: "info", label: "Klubbinnstillinger", content: <KlubbInnstillingerView /> },
                    { value: "booking", label: "Bookinginnstillinger", content: <BookingInnstillingerView /> },
                ]}
                value={tab}
                onValueChange={setTab}
            />
        </Page>
    );
}
