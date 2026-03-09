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
import { X } from "lucide-react";
import type { GenererKampplanForespørsel } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerer: (payload: GenererKampplanForespørsel) => void;
  isPending: boolean;
};

function defaultStartTid(): string {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`;
}

export function GenererKampplanDialog({ open, onOpenChange, onGenerer, isPending }: Props) {
  const [startTid, setStartTid] = useState<string>(defaultStartTid);
  const [kampVarighetMinutter, setKampVarighetMinutter] = useState<string>("60");
  const [baner, setBaner] = useState<string[]>([]);
  const [baneinput, setBaneinput] = useState<string>("");

  function leggTilBane() {
    const trimmed = baneinput.trim();
    if (!trimmed || baner.includes(trimmed)) return;
    setBaner((prev) => [...prev, trimmed]);
    setBaneinput("");
  }

  function fjernBane(bane: string) {
    setBaner((prev) => prev.filter((b) => b !== bane));
  }

  function handleGenerer() {
    if (!startTid || baner.length === 0) return;
    const varighet = Number(kampVarighetMinutter);
    onGenerer({
      startTid: new Date(startTid).toISOString(),
      kampVarighetMinutter: varighet > 0 ? varighet : undefined,
      baner,
    });
  }

  function handleClose(v: boolean) {
    if (!v) {
      setStartTid(defaultStartTid());
      setKampVarighetMinutter("60");
      setBaner([]);
      setBaneinput("");
    }
    onOpenChange(v);
  }

  const kanGenerer = !!startTid && baner.length > 0 && Number(kampVarighetMinutter) > 0;

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
            <Label htmlFor="kampplan-varighet">Kampvarighet (minutter)</Label>
            <Input
              id="kampplan-varighet"
              type="number"
              min={1}
              value={kampVarighetMinutter}
              onChange={(e) => setKampVarighetMinutter(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Baner</Label>
            <div className="flex gap-2">
              <Input
                placeholder="t.eks. Bane A"
                value={baneinput}
                onChange={(e) => setBaneinput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    leggTilBane();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={leggTilBane}
                disabled={!baneinput.trim()}
              >
                Legg til
              </Button>
            </div>
            {baner.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {baner.map((bane) => (
                  <span
                    key={bane}
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                  >
                    {bane}
                    <button
                      type="button"
                      onClick={() => fjernBane(bane)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
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
