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
} from "@/components/ui/alert-dialog.js";
import { Button } from "@/components/ui/button.js";
import { useAuth } from "../hooks/useAuth.js";
import type { UseMutationResult } from "@tanstack/react-query";

interface SlettMegDialogProps {
  slettMeg: UseMutationResult<void, Error, void>;
}

export default function SlettMegDialog({ slettMeg }: SlettMegDialogProps) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await slettMeg.mutateAsync();
      setOpen(false);
      await signOut();
    } catch {
      // Feil-toast håndteres i useMeg
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={slettMeg.isPending}>
          {slettMeg.isPending ? "Sletter..." : "Slett min bruker"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
          <AlertDialogDescription>
            Dette vil slette din bruker og all tilknytning permanent. Denne
            handlingen kan ikke angres.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={slettMeg.isPending}>
            Avbryt
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={slettMeg.isPending}
          >
            {slettMeg.isPending ? "Sletter..." : "Slett bruker"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
