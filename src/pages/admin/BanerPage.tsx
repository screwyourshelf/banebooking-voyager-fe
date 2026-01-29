import { useState } from "react";
import Page from "@/components/Page.js";
import SimpleTabsLazy from "@/components/SimpleTabsLazy.js";

import RedigerBaneTab from "@/pages/admin/baner/RedigerBaneTab.js";
import NyBaneTab from "@/pages/admin/baner/NyBaneTab.js";

export default function BanerPage() {
  const [tab, setTab] = useState("rediger");

  return (
    <Page>
      <SimpleTabsLazy
        items={[
          {
            value: "rediger",
            label: "Rediger bane",
            content: <RedigerBaneTab />,
          },
          {
            value: "ny",
            label: "Ny bane",
            content: <NyBaneTab />,
          },
        ]}
        value={tab}
        onValueChange={setTab}
      />
    </Page>
  );
}
