import { useState } from "react";
import { useSlug } from "@/hooks/useSlug.js";

import Page from "@/components/Page.js";
import SimpleTabsLazy from "@/components/SimpleTabsLazy.js";

import KlubbInfoTab from "@/pages/admin/klubb/KlubbInfoTab.js";
import KlubbBookingTab from "@/pages/admin/klubb/KlubbBookingTab.js";

export default function KlubbPage() {
  const [tab, setTab] = useState("info");
  const slug = useSlug();

  return (
    <Page>
      <SimpleTabsLazy
        items={[
          {
            value: "info",
            label: "Informasjon",
            content: <KlubbInfoTab slug={slug} />,
          },
          {
            value: "booking",
            label: "Bookingregler",
            content: <KlubbBookingTab slug={slug} />,
          },
        ]}
        value={tab}
        onValueChange={setTab}
      />
    </Page>
  );
}
