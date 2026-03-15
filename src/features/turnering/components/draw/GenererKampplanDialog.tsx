import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBaner } from "@/hooks/useBaner";
import type { GenererKampplanForespørsel } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forslagStartTid?: string | null;
  onGenerer: (payload: GenererKampplanForespørsel) => void;
  isPending: boolean;
};

function toDatetimeLocal(isoOrDato: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(isoOrDato)) {
    return isoOrDato.substring(0, 16);
  }
  return `${isoOrDato}T09:00`;
}

function defaultStartTid(forslagStartTid?: string | null): string {
  if (forslagStartTid) {
    return toDatetimeLocal(forslagStartTid);
  }
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`;
}

const VARIGHET_VERDIER = [30, 60, 90, 120] as const;

export function GenererKampplanDialog({
  open,
  onOpenChange,
  forslagStartTid,
  onGenerer,
  isPending,
}: Props) {
  const { baner: tilgjengeligeBaner } = useBaner(false);

  const [startTid, setStartTid] = useState<string>(() => defaultStartTid(forslagStartTid));
  const [varighetIndex, setVarighetIndex] = useState(1);
  const [valgteBaner, setValgteBaner] = useState<string[]>([]);

  function toggleBane(navn: string) {
    setValgteBaner((prev) =>
      prev.includes(navn) ? prev.filter((b) => b !== navn) : [...prev, navn]
    );
  }

  function handleGenerer() {
    if (!startTid || valgteBaner.length === 0) return;
    onGenerer({
      startTid: new Date(startTid).toISOString(),
      kampVarighetMinutter: VARIGHET_VERDIER[varighetIndex],
      baner: valgteBaner,
    });
  }

  function handleClose(v: boolean) {
    if (!v) {
      setStartTid(defaultStartTid(forslagStartTid));
      setVarighetIndex(1);
      setValgteBaner([]);
    }
    onOpenChange(v);
  }

  const kanGenerer = !!startTid && valgteBaner.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generer kampplan</DialogTitle>
          <DialogDescription>
            Kampplanen er et forslag og kan genereres på nytt ved behov.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="kampplan-starttid">Starttid</Label>
            <Input
              id="kampplan-starttid"
              type="datetime-local"
              value={startTid}
              onChange={(e) => setStartTid(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Kampvarighet</Label>
              <span className="text-sm font-medium tabular-nums">
                {VARIGHET_VERDIER[varighetIndex]} min
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={VARIGHET_VERDIER.length - 1}
              step={1}
              value={varighetIndex}
              onChange={(e) => setVarighetIndex(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              {VARIGHET_VERDIER.map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Baner</Label>
            {tilgjengeligeBaner.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Ingen aktive baner funnet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tilgjengeligeBaner.map((b) => (
                  <Button
                    key={b.id}
                    type="button"
                    size="sm"
                    variant={valgteBaner.includes(b.navn) ? "default" : "outline"}
                    onClick={() => toggleBane(b.navn)}
                  >
                    {b.navn}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button onClick={handleGenerer} disabled={isPending || !kanGenerer}>
              {isPending ? "Genererer..." : "Generer kampplan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
