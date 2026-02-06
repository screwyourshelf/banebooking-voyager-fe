import Page from "@/components/Page";
import Tabs from "@/components/navigation/Tabs";

import MineBookingerView from "@/features/minside/views/mine-bookinger/MineBookingerView";
import KommendeArrangementerView from "@/features/minside/views/kommende-arrangementer/KommendeArrangementerView";
import MinProfilView from "@/features/minside/views/min-profil/MinProfilView";
import PersondataView from "@/features/minside/views/persondata/PersondataView";

export default function MinSidePage() {
    return (
        <Page>
            <Tabs
                defaultValue="bookinger"
                items={[
                    { value: "bookinger", label: "Bookinger", content: <MineBookingerView /> },
                    { value: "kommende-arrangementer", label: "Arrangement", content: <KommendeArrangementerView /> },
                    { value: "profil", label: "Profil", content: <MinProfilView /> },
                    { value: "persondata", label: "Data", content: <PersondataView /> },
                ]}
            />
        </Page>
    );
}
