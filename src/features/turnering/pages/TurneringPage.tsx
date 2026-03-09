import { useParams } from "react-router-dom";
import Page from "@/components/Page";
import TurneringView from "../views/turnering/TurneringView";

export default function TurneringPage() {
  const { turneringId } = useParams<{ turneringId: string }>();

  if (!turneringId) return null;

  return (
    <Page>
      <TurneringView turneringId={turneringId} />
    </Page>
  );
}
