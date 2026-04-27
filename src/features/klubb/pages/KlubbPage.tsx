import Page from "@/components/Page";
import Tabs from "@/components/navigation/Tabs";

import KlubbInnstillingerView from "@/features/klubb/views/klubb-innstillinger/KlubbInnstillingerView";
import MedlemskapInnstillingerView from "@/features/klubb/views/medlemskap-innstillinger/MedlemskapInnstillingerView";

export default function KlubbPage() {
  return (
    <Page>
      <Tabs
        defaultValue="info"
        items={[
          { value: "info", label: "Klubbinnstillinger", content: <KlubbInnstillingerView /> },
          { value: "medlemskap", label: "Medlemskap", content: <MedlemskapInnstillingerView /> },
        ]}
      />
    </Page>
  );
}
