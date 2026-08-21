import BrukereListeView from "@/features/brukere/views/brukere-liste/BrukereListeView";
import { Page } from "@/components";

export default function BrukerePage() {
  return (
    <Page
      eyebrow="Administrasjon"
      title="Brukere"
      description="Følg opp medlemskap, roller og tilgang til klubben."
    >
      <BrukereListeView />
    </Page>
  );
}
