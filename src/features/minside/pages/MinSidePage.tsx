import Page from "@/components/Page";
import Tabs from "@/components/navigation/Tabs";

import MineBookingerView from "@/features/minside/views/mine-bookinger/MineBookingerView";
import MinProfilView from "@/features/minside/views/min-profil/MinProfilView";
import PersondataView from "@/features/minside/views/persondata/PersondataView";

export default function MinSidePage() {
    return (
        <Page>
            <Tabs
                defaultValue="bookinger"
                items={[
                    { value: "bookinger", label: "Mine bookinger", content: <MineBookingerView /> },
                    { value: "profil", label: "Min profil", content: <MinProfilView /> },
                    { value: "persondata", label: "Persondata", content: <PersondataView /> },
                ]}
            />
        </Page>
    );
}
