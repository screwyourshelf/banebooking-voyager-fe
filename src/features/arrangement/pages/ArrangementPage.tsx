import Page from "@/components/Page";
import Tabs from "@/components/navigation/Tabs";

import ArrangementView from "@/features/arrangement/views/arrangement/ArrangementView";
import RedigerArrangementView from "@/features/arrangement/views/rediger-arrangement/RedigerArrangementView";

export default function ArrangementPage() {
  return (
    <Page>
      <Tabs
        defaultValue="opprett"
        items={[
          { value: "opprett", label: "Opprett nytt", content: <ArrangementView /> },
          { value: "rediger", label: "Rediger eksisterende", content: <RedigerArrangementView /> },
        ]}
      />
    </Page>
  );
}
