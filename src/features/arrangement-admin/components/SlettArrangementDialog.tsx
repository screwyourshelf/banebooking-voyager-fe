import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
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
  harTurnering?: boolean;
}

export default function SlettArrangementDialog({
  tittel,
  onSlett,
  trigger,
  harTurnering = false,
}: SlettArrangementDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bekreftTurnering, setBekreftTurnering] = useState(false);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) setBekreftTurnering(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onSlett();
      setOpen(false);
    } catch {
      // evt. toast.error
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
            {harTurnering
              ? `Er du sikker på at du vil avlyse «${tittel}»? Alle tilknyttede bookinger vil slettes, og arrangementet kobles fra turneringen.`
              : `Er du sikker på at du vil avlyse «${tittel}»? Alle tilknyttede bookinger vil slettes.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {harTurnering && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <div className="flex items-center gap-3 flex-1">
              <Switch
                id="bekreft-turnering"
                checked={bekreftTurnering}
                onCheckedChange={setBekreftTurnering}
                disabled={isDeleting}
              />
              <Label htmlFor="bekreft-turnering" className="text-sm font-normal">
                Ja, jeg forstår konsekvensene
              </Label>
            </div>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              disabled={isDeleting || (harTurnering && !bekreftTurnering)}
              onClick={handleDelete}
            >
              {isDeleting ? "Avlyser..." : "Ja, avlys"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
