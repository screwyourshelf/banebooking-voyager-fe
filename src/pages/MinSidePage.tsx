import { useState } from "react";
import { useSlug } from "@/hooks/useSlug.js";

import Page from "@/components/Page.js";
import SimpleTabsLazy from "@/components/SimpleTabsLazy.js";

import MinProfilTab from "@/pages/minside/MinProfilTab";
import PersondataTab from "@/pages/minside/PersondataTab";
import MineBookingerTab from "@/pages/minside/MineBookingerTab";

export default function MinSidePage() {
    const [tab, setTab] = useState("bookinger");
    const slug = useSlug();

    return (
        <Page>
            <SimpleTabsLazy
                items={[
                    { value: "bookinger", label: "Mine bookinger", content: <MineBookingerTab slug={slug} /> },
                    { value: "profil", label: "Min profil", content: <MinProfilTab slug={slug} /> },
                    { value: "persondata", label: "Persondata", content: <PersondataTab slug={slug} /> },
                ]}
                value={tab}
                onValueChange={setTab}
            />
        </Page>
    );
}
