import Tabs from "@/components/navigation/Tabs";
import { useSearchParams } from "react-router-dom";
import { Page } from "@/components";

import MinProfilView from "@/features/minside/views/min-profil/MinProfilView";
import PersondataView from "@/features/minside/views/persondata/PersondataView";

const validTabs = ["profil", "persondata"];

export default function MinSidePage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : "profil";

  return (
    <Page
      eyebrow="Min konto"
      title="Min side"
      description="Oppdater profilen og få innsyn i dataene som er lagret om deg."
    >
      <Tabs
        variant="section"
        ariaLabel="Områder på Min side"
        defaultValue={defaultTab}
        items={[
          {
            value: "profil",
            label: "Profil",
            content: <MinProfilView />,
          },
          {
            value: "persondata",
            label: "Data",
            content: <PersondataView />,
          },
        ]}
      />
    </Page>
  );
}
