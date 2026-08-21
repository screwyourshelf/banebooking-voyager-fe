import NyheterView from "@/features/feed/views/nyheter/NyheterView";
import { Page } from "@/components";

export default function NyheterPage() {
  return (
    <Page eyebrow="Klubben" title="Nyheter" description="Siste nytt fra klubben.">
      <NyheterView />
    </Page>
  );
}
