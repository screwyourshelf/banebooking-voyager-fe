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
import type { UseMutationResult } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ServerFeil } from "@/components/errors";

type Props = {
  slettMeg: UseMutationResult<void, Error, void>;
  disabled?: boolean;
};

export default function SlettMegDialog({ slettMeg, disabled = false }: Props) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const isBusy = slettMeg.isPending;

  const handleDelete = async () => {
    try {
      await slettMeg.mutateAsync();
      setOpen(false);
      await signOut();
    } catch {
      // feil vises via slettMeg.error i dialogen
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={disabled || isBusy}>
          {isBusy ? "Sletter…" : "Slett kontoen min"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Slett kontoen?</AlertDialogTitle>
          <AlertDialogDescription>
            Dette sletter kontoen og alle tilknyttede data permanent. Handlingen kan ikke angres.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <ServerFeil feil={slettMeg.error?.message ?? null} />
          <AlertDialogCancel disabled={isBusy}>Avbryt</AlertDialogCancel>

          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isBusy}>
            {isBusy ? "Sletter…" : "Slett konto"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
