import Page from "@/components/Page";
import Tabs from "@/components/navigation/Tabs";

import OpprettArrangementView from "@/features/arrangement-admin/views/arrangement/OpprettArrangementView";
import RedigerArrangementView from "@/features/arrangement-admin/views/rediger-arrangement/RedigerArrangementView";

export default function ArrangementPage() {
  return (
    <Page>
      <Tabs
        defaultValue="opprett"
        items={[
          { value: "opprett", label: "Opprett nytt", content: <OpprettArrangementView /> },
          { value: "rediger", label: "Rediger eksisterende", content: <RedigerArrangementView /> },
        ]}
      />
    </Page>
  );
}
