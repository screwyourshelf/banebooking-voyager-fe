import { Button } from "@/components/ui/button";
import { useArrangementPaamelding } from "./useArrangementPaamelding";
import { toast } from "sonner";
import { Users } from "lucide-react";

type Props = {
  arrangementId: string;
  erPaameldt: boolean;
  antallPaameldte: number;
};

export default function PaameldingKnapp({ arrangementId, erPaameldt, antallPaameldte }: Props) {
  const { meldPaa, meldAv } = useArrangementPaamelding(arrangementId);
  const isLoading = meldPaa.isPending || meldAv.isPending;

  const handleClick = async () => {
    try {
      if (erPaameldt) {
        await meldAv.mutateAsync();
        toast.success("Du er avmeldt.");
      } else {
        await meldPaa.mutateAsync();
        toast.success("Du er påmeldt!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Noe gikk galt");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        {antallPaameldte} påmeldt
      </span>
      <Button
        size="sm"
        variant={erPaameldt ? "outline" : "default"}
        disabled={isLoading}
        onClick={handleClick}
      >
        {isLoading ? "Venter..." : erPaameldt ? "Meld av" : "Meld på"}
      </Button>
    </div>
  );
}
