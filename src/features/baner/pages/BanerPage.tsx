import Page from "@/components/Page";
import Tabs from "@/components/navigation/Tabs";

import RedigerBaneView from "@/features/baner/views/rediger-bane/RedigerBaneView";
import NyBaneView from "@/features/baner/views/ny-bane/NyBaneView";

export default function BanerPage() {
  return (
    <Page>
      <Tabs
        defaultValue="rediger"
        items={[
          { value: "rediger", label: "Rediger bane", content: <RedigerBaneView /> },
          { value: "ny", label: "Ny bane", content: <NyBaneView /> },
        ]}
      />
    </Page>
  );
}
