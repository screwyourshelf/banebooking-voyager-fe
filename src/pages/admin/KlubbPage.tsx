import { useState } from "react";

import Page from "@/components/Page.js";
import SimpleTabsLazy from "@/components/SimpleTabsLazy.js";

import KlubbInfoTab from "@/pages/admin/klubb/KlubbInfoTab.js";
import KlubbBookingTab from "@/pages/admin/klubb/KlubbBookingTab.js";

export default function KlubbPage() {
  const [tab, setTab] = useState("info");

  return (
    <Page>
      <SimpleTabsLazy
        items={[
          {
            value: "info",
            label: "Klubbinnstillinger",
            content: <KlubbInfoTab />,
          },
          {
            value: "booking",
            label: "Bookinginnstillinger",
            content: <KlubbBookingTab />,
          },
        ]}
        value={tab}
        onValueChange={setTab}
      />
    </Page>
  );
}
