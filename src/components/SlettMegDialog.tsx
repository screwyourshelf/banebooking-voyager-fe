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
import { cn } from "@/lib/utils";
import { useAuth } from "../hooks/useAuth";

type Props = {
  slettMeg: UseMutationResult<void, Error, void>;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function SlettMegDialog({
  slettMeg,
  fullWidth = false,
  disabled = false,
  className,
}: Props) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const isBusy = slettMeg.isPending;

  const handleDelete = async () => {
    try {
      await slettMeg.mutateAsync();
      setOpen(false);
      await signOut();
    } catch {
      // Feil-toast h�ndteres i useMeg
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={disabled || isBusy}
          className={cn(fullWidth && "w-full", className)}
        >
          {isBusy ? "Sletter..." : "Slett min bruker"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
          <AlertDialogDescription>
            Dette vil slette din bruker og all tilknytning permanent. Denne handlingen kan ikke
            angres.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>Avbryt</AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete} disabled={isBusy}>
              {isBusy ? "Sletter..." : "Slett bruker"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
