import { RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import { AdminPageState } from "./AdminPage";

type Props = {
  feil: string;
  isFetching?: boolean;
  onRetry: () => void;
};

export default function AdminAccessError({ feil, isFetching = false, onRetry }: Props) {
  return (
    <AdminPageState>
      <RecordListState
        title="Kunne ikke kontrollere tilgangen"
        description={feil}
        action={
          <Button type="button" variant="outline" onClick={onRetry} disabled={isFetching}>
            {isFetching ? "Prøver igjen…" : "Prøv igjen"}
          </Button>
        }
        tone="danger"
        role="alert"
      />
    </AdminPageState>
  );
}
