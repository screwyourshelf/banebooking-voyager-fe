import { TriangleAlert } from "lucide-react";
import ErrorShell from "@/app/ErrorShell";
import { ErrorDisplay } from "@/components/errors/ErrorDisplay";
import { Button } from "@/components/ui/button";

type Props = {
  error: Error;
  isFetching: boolean;
  onRetry: () => void;
};

export default function BookingBootstrapError({ error, isFetching, onRetry }: Props) {
  return (
    <ErrorShell>
      <ErrorDisplay
        icon={TriangleAlert}
        title="Kunne ikke starte bookingen"
        description="Bookingdataene kunne ikke lastes. Prøv igjen om litt."
        error={error}
      >
        <Button type="button" variant="outline" onClick={onRetry} disabled={isFetching}>
          {isFetching ? "Prøver igjen…" : "Prøv igjen"}
        </Button>
      </ErrorDisplay>
    </ErrorShell>
  );
}
