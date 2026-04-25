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
import { useAktiveArrangementer } from "../hooks/useAktiveArrangementer";

type Props = {
  valgtId: string | null;
  onVelg: (id: string | null, tittel?: string) => void;
  children: React.ReactNode;
};

export default function KobleTilArrangementDialog({ valgtId, onVelg, children }: Props) {
  const [open, setOpen] = useState(false);
  const [lokaltValgtId, setLokaltValgtId] = useState<string | null>(valgtId);

  const { data, isLoading } = useAktiveArrangementer(open);

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) setLokaltValgtId(valgtId);
    setOpen(isOpen);
  }

  function handleBekreft() {
    const valgt = data?.find((a) => a.id === lokaltValgtId);
    onVelg(lokaltValgtId, valgt?.tittel);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Koble til arrangement</DialogTitle>
          <DialogDescription className="sr-only">
            Velg et arrangement å knytte bookingen til
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Velg et pågående arrangement å knytte bookingen til, eller bekreft uten tilknytning.
        </p>

        <div className="max-h-[50dvh] overflow-y-auto pr-1">
          {isLoading && (
            <p className="text-sm text-muted-foreground italic">Henter arrangementer…</p>
          )}

          {!isLoading && data?.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Ingen aktive arrangementer funnet.
            </p>
          )}

          {data && data.length > 0 && (
            <ul className="space-y-1 pb-1">
              {data.map((arr) => (
                <li key={arr.id}>
                  <button
                    type="button"
                    aria-label="Velg arrangement"
                    onClick={() => setLokaltValgtId(lokaltValgtId === arr.id ? null : arr.id)}
                    className={`w-full overflow-hidden rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      lokaltValgtId === arr.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className="font-medium">{arr.tittel}</div>
                    {arr.beskrivelse && (
                      <div className="mt-0.5 truncate text-xs opacity-70">{arr.beskrivelse}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Avbryt
          </Button>
          <Button onClick={handleBekreft}>Bekreft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
