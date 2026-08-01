import { useState } from "react";
import { SettingsPanel, SettingsSection, SettingsSwitchRow } from "@/components/admin";
import { Button } from "@/components/ui/button";
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
  const [feil, setFeil] = useState<string | null>(null);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setBekreftTurnering(false);
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
            {harTurnering
              ? `Er du sikker på at du vil avlyse «${tittel}»? Alle tilknyttede bookinger vil slettes, og arrangementet kobles fra turneringen.`
              : `Er du sikker på at du vil avlyse «${tittel}»? Alle tilknyttede bookinger vil slettes.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {harTurnering && (
          <SettingsSection
            title="Turnering kobles fra"
            description="Bekreft at du forstår at tilknytningen til turneringen fjernes."
            tone="danger"
            embedded
          >
            <SettingsPanel>
              <SettingsSwitchRow
                title="Jeg forstår konsekvensene"
                checked={bekreftTurnering}
                onCheckedChange={setBekreftTurnering}
                disabled={isDeleting}
              />
            </SettingsPanel>
          </SettingsSection>
        )}
        <AlertDialogFooter>
          <ServerFeil feil={feil} />
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
