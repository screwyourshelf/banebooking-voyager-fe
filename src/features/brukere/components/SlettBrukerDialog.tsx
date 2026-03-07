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

type Props = {
  brukerEpost: string;
  onSlett: () => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
};

export default function SlettBrukerDialog({
  brukerEpost,
  onSlett,
  disabled = false,
  isLoading = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const handleDelete = async () => {
    setIsBusy(true);
    try {
      await onSlett();
      setOpen(false);
    } catch {
      // Feil-toast håndteres i useAdminBrukere
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
