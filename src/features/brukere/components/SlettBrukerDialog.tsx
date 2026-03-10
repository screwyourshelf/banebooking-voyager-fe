import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ServerFeil } from "@/components/errors";

type Props = {
  brukerEpost: string;
  onSlett: () => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  serverFeil?: string | null;
};

export default function SlettBrukerDialog({
  brukerEpost,
  onSlett,
  disabled = false,
  isLoading = false,
  serverFeil = null,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const handleDelete = async () => {
    setIsBusy(true);
    try {
      await onSlett();
      setOpen(false);
    } catch {
      // feil vises via serverFeil-prop i dialogen
    } finally {
      setIsBusy(false);
    }
  };

  const loading = isBusy || isLoading;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={disabled || loading}
          className="flex items-center gap-2 text-sm"
        >
          {loading ? "Sletter..." : "Slett"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Slett bruker?</AlertDialogTitle>
          <AlertDialogDescription>
            Dette vil slette brukeren <strong>{brukerEpost}</strong> og all tilknyttet data
            permanent. Denne handlingen kan ikke angres.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <ServerFeil feil={serverFeil} />
          <AlertDialogCancel disabled={loading}>Avbryt</AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Sletter..." : "Slett bruker"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
