import { useState } from "react";
import Page from "@/components/Page";
import { TabsLazyMount } from "@/components/navigation";

import RedigerBaneTab from "@/pages/admin/baner/RedigerBaneTab";
import NyBaneTab from "@/pages/admin/baner/NyBaneTab";

export default function BanerPage() {
    const [tab, setTab] = useState("rediger");

    return (
        <Page>
            <TabsLazyMount
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
