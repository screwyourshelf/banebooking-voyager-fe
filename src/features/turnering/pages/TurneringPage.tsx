import { useParams } from "react-router-dom";
import TurneringView from "../views/turnering/TurneringView";
import { Page } from "@/components";

export default function TurneringPage() {
  const { turneringId } = useParams<{ turneringId: string }>();

  if (!turneringId) return null;

  return (
    <Page>
      <TurneringView turneringId={turneringId} />
    </Page>
  );
}
