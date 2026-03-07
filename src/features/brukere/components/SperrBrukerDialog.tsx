import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import DatoVelger from "@/components/DatoVelger";
import type { SperrBrukerForespørsel } from "@/types";

type Props = {
  brukerEpost: string;
  onSperr: (data: SperrBrukerForespørsel) => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
};

export default function SperrBrukerDialog({
  brukerEpost,
  onSperr,
  disabled = false,
  isLoading = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [årsak, setÅrsak] = useState("");
  const [aktivTil, setAktivTil] = useState<Date | null>(null);

  const loading = isBusy || isLoading;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setÅrsak("");
      setAktivTil(null);
    }
    setOpen(isOpen);
  };

  const handleSperr = async () => {
    setIsBusy(true);
    try {
      await onSperr({
        type: "ManuellSperre",
        årsak,
        aktivTil: aktivTil ? aktivTil.toISOString() : null,
      });
      setOpen(false);
      setÅrsak("");
      setAktivTil(null);
    } catch {
      // Feil-toast håndteres i useAdminBrukersperre
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={disabled || loading}
          className="flex items-center gap-2 text-sm"
        >
          Sperr
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sperr bruker</DialogTitle>
          <DialogDescription>
            Sperr <strong>{brukerEpost}</strong> fra å booke og melde seg på arrangementer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Årsak</div>
            <Field>
              <Input
                id="sperre-aarsak"
                value={årsak}
                onChange={(e) => setÅrsak(e.target.value)}
                placeholder="Årsak til sperringen (3–500 tegn)"
                className="bg-background"
              />
            </Field>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Aktiv til (valgfritt)</div>
            <DatoVelger
              value={aktivTil}
              onChange={(dato) => setAktivTil(dato)}
              minDate={new Date()}
              visNavigering={false}
            />
            {aktivTil && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAktivTil(null)}
                className="text-xs text-muted-foreground"
              >
                Fjern utløpsdato
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Avbryt
          </Button>
          <Button
            variant="destructive"
            onClick={handleSperr}
            disabled={loading || årsak.trim().length < 3}
          >
            {loading ? "Sperrer..." : "Sperr bruker"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
