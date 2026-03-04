import Page from "@/components/Page";
import Tabs from "@/components/navigation/Tabs";
import { useSearchParams } from "react-router-dom";

import MinProfilView from "@/features/minside/views/min-profil/MinProfilView";
import PersondataView from "@/features/minside/views/persondata/PersondataView";

const validTabs = ["profil", "persondata"];

export default function MinSidePage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : "profil";

  return (
    <Page>
      <Tabs
        defaultValue={defaultTab}
        items={[
          { value: "profil", label: "Profil", content: <MinProfilView /> },
          { value: "persondata", label: "Data", content: <PersondataView /> },
        ]}
      />
    </Page>
  );
}
