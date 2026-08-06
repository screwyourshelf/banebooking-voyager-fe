import { AdminPage } from "@/components/admin";
import BrukereListeView from "@/features/brukere/views/brukere-liste/BrukereListeView";

export default function BrukerePage() {
  return (
    <AdminPage
      eyebrow="Administrasjon"
      title="Brukere"
      description="Følg opp medlemskap, roller og tilgang til klubben."
    >
      <BrukereListeView />
    </AdminPage>
  );
}
