import Page from "@/components/Page";
import BrukereListeView from "@/features/brukere/views/brukere-liste/BrukereListeView";

export default function BrukerePage() {
  return (
    <Page width="xl" className="user-admin-page">
      <BrukereListeView />
    </Page>
  );
}
