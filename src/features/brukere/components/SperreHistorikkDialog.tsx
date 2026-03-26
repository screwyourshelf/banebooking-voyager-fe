import { format } from "date-fns";
import { nb } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stack, Inline } from "@/components/layout";
import { useBrukerSperrer } from "@/features/brukere/hooks/useAdminBrukersperre";
import { ServerFeil } from "@/components/errors";

type Props = {
  brukerId: string;
  brukerEpost: string;
  kanOppheve: boolean;
  onOpphev: (sperreId: string) => Promise<void>;
  opphevLaster: boolean;
  opphevFeil: string | null;
  onClose: () => void;
};

export default function SperreHistorikkDialog({
  brukerId,
  brukerEpost,
  kanOppheve,
  onOpphev,
  opphevLaster,
  opphevFeil,
  onClose,
}: Props) {
  const { data, isLoading } = useBrukerSperrer(brukerId, true);

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sperrer</DialogTitle>
          <DialogDescription className="sr-only">Administrer sperrer for bruker</DialogDescription>
        </DialogHeader>

        <Stack gap="lg" className="overflow-y-auto max-h-[60vh] pr-1">
          <Stack gap="xs">
            <div className="text-xs text-muted-foreground">Bruker</div>
            <div className="text-sm font-medium break-words">{brukerEpost}</div>
          </Stack>

          {isLoading && <p className="text-sm text-muted-foreground">Henter sperrer…</p>}

          {data && data.sperrer.length === 0 && (
            <p className="text-sm text-muted-foreground italic">Ingen sperrer registrert.</p>
          )}

          {data && data.sperrer.length > 0 && (
            <Stack gap="sm" as="ul">
              {data.sperrer.map((sperre) => (
                <li key={sperre.id} className="rounded-md border p-3 text-sm">
                  <Stack gap="xs">
                    <Inline gap="md" justify="between">
                      <span className="font-medium break-words">{sperre.årsak}</span>
                      {sperre.erAktiv ? (
                        <Badge variant="destructive" className="shrink-0">
                          Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0">
                          Opphevet
                        </Badge>
                      )}
                    </Inline>
                    <div className="text-xs text-muted-foreground">
                      Sperret av: {sperre.opprettetAv} ·{" "}
                      {format(new Date(sperre.opprettetTidspunkt), "dd.MM.yyyy HH:mm", {
                        locale: nb,
                      })}
                    </div>
                    {sperre.aktivTil && (
                      <div className="text-xs text-muted-foreground">
                        Utløper: {format(new Date(sperre.aktivTil), "dd.MM.yyyy", { locale: nb })}
                      </div>
                    )}
                    {sperre.opphevtAv && sperre.opphevtTidspunkt && (
                      <div className="text-xs text-muted-foreground">
                        Opphevet av: {sperre.opphevtAv} ·{" "}
                        {format(new Date(sperre.opphevtTidspunkt), "dd.MM.yyyy HH:mm", {
                          locale: nb,
                        })}
                      </div>
                    )}
                    {sperre.erAktiv && kanOppheve && (
                      <div className="pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={opphevLaster}
                          onClick={() => onOpphev(sperre.id)}
                        >
                          {opphevLaster ? "Opphever..." : "Opphev"}
                        </Button>
                      </div>
                    )}
                  </Stack>
                </li>
              ))}
            </Stack>
          )}

          <ServerFeil feil={opphevFeil} />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
