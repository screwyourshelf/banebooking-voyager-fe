import Page from "@/components/Page";
import Tabs from "@/components/navigation/Tabs";

import KlubbInnstillingerView from "@/features/klubb/views/klubb-innstillinger/KlubbInnstillingerView";

export default function KlubbPage() {
  return (
    <Page>
      <Tabs
        defaultValue="info"
        items={[
          { value: "info", label: "Klubbinnstillinger", content: <KlubbInnstillingerView /> },
        ]}
      />
    </Page>
  );
}
