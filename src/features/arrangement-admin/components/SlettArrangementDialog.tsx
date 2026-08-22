import { useState } from "react";

import { ServerFeil } from "@/components/errors";
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

interface SlettArrangementDialogProps {
  tittel: string;
  onSlett: () => Promise<void>;
  trigger: React.ReactNode;
}

export default function SlettArrangementDialog({
  tittel,
  onSlett,
  trigger,
}: SlettArrangementDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setFeil(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setFeil(null);
    try {
      await onSlett();
      setOpen(false);
    } catch (err) {
      setFeil(err instanceof Error ? err.message : "Kunne ikke avlyse arrangement.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Avlys arrangement</AlertDialogTitle>
          <AlertDialogDescription>
            Er du sikker på at du vil avlyse «{tittel}»? Alle tilknyttede banetider slettes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <ServerFeil feil={feil} />
          <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isDeleting} onClick={handleDelete}>
            {isDeleting ? "Avlyser..." : "Ja, avlys"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
