import ArrangementerView from "@/features/arrangementer/views/arrangementer/ArrangementerView";
import { Page } from "@/components";

export default function ArrangementerPage() {
  return (
    <Page
      eyebrow="Klubben"
      title="Arrangementer"
      description="Se hva som skjer, når det starter og hvilke baner som brukes."
    >
      <ArrangementerView />
    </Page>
  );
}
