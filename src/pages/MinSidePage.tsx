import { useState } from "react";

import Page from "@/components/Page.js";
import SimpleTabsLazy from "@/components/SimpleTabsLazy.js";

import MinProfilTab from "@/pages/minside/MinProfilTab";
import PersondataTab from "@/pages/minside/PersondataTab";
import MineBookingerTab from "@/pages/minside/MineBookingerTab";

export default function MinSidePage() {
    const [tab, setTab] = useState("bookinger");

    return (
        <Page>
            <SimpleTabsLazy
                items={[
                    { value: "bookinger", label: "Mine bookinger", content: <MineBookingerTab /> },
                    { value: "profil", label: "Min profil", content: <MinProfilTab /> },
                    { value: "persondata", label: "Persondata", content: <PersondataTab /> },
                ]}
                value={tab}
                onValueChange={setTab}
            />
        </Page>
    );
}
