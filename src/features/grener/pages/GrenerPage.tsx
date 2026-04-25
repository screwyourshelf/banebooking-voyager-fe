import Page from "@/components/Page";
import Tabs from "@/components/navigation/Tabs";

import RedigerGrenView from "@/features/grener/views/rediger-gren/RedigerGrenView";
import NyGrenView from "@/features/grener/views/ny-gren/NyGrenView";

export default function GrenerPage() {
  return (
    <Page>
      <Tabs
        defaultValue="rediger"
        items={[
          { value: "rediger", label: "Rediger gren", content: <RedigerGrenView /> },
          { value: "ny", label: "Ny gren", content: <NyGrenView /> },
        ]}
      />
    </Page>
  );
}
