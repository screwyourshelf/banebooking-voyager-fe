import { useState } from "react";
import { useSlug } from "@/hooks/useSlug.js";
import Page from "@/components/Page.js";
import SimpleTabsLazy from "@/components/SimpleTabsLazy.js";

import RedigerBaneTab from "@/pages/admin/baner/RedigerBaneTab.js";
import NyBaneTab from "@/pages/admin/baner/NyBaneTab.js";

export default function BanerPage() {
  const [tab, setTab] = useState("rediger");
  const slug = useSlug();

  return (
    <Page>
      <SimpleTabsLazy
        items={[
          {
            value: "rediger",
            label: "Rediger bane",
            content: <RedigerBaneTab slug={slug} />,
          },
          {
            value: "ny",
            label: "Ny bane",
            content: <NyBaneTab slug={slug} />,
          },
        ]}
        value={tab}
        onValueChange={setTab}
      />
    </Page>
  );
}
