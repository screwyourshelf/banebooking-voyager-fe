import Page from "@/components/Page";
import Tabs from "@/components/navigation/Tabs";
import { useSearchParams } from "react-router-dom";

import MineBookingerView from "@/features/minside/views/mine-bookinger/MineBookingerView";
import MinProfilView from "@/features/minside/views/min-profil/MinProfilView";
import PersondataView from "@/features/minside/views/persondata/PersondataView";

const validTabs = ["bookinger", "profil", "persondata"];

export default function MinSidePage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : "bookinger";

  return (
    <Page>
      <Tabs
        defaultValue={defaultTab}
        items={[
          { value: "bookinger", label: "Bookinger", content: <MineBookingerView /> },
          { value: "profil", label: "Profil", content: <MinProfilView /> },
          { value: "persondata", label: "Data", content: <PersondataView /> },
        ]}
      />
    </Page>
  );
}
