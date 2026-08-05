import ActionFeedback from "@/components/feedback/ActionFeedback";
import { Button } from "@/components/ui/button";

type Props = {
  feil: string;
  isFetching?: boolean;
  onRetry: () => void;
};

export default function BrukerdataFeil({ feil, isFetching = false, onRetry }: Props) {
  return (
    <div className="guard-feedback">
      <ActionFeedback
        tone="danger"
        title="Kunne ikke kontrollere kontoen"
        description={feil}
        action={
          <Button type="button" variant="outline" onClick={onRetry} disabled={isFetching}>
            {isFetching ? "Prøver igjen…" : "Prøv igjen"}
          </Button>
        }
      />
    </div>
  );
}
