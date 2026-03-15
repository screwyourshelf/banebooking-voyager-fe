import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServerFeil } from "@/components/errors";
import type { OppdaterPaameldingDetaljerForespørsel, BrukerRespons } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spillerNavn: string;
  spiller2Navn?: string | null;
  erDobbel?: boolean;
  gjeldendeSeed?: number | null;
  brukere?: BrukerRespons[];
  onOppdaterSeed?: (seed: number | null) => void;
  onOppdaterDetaljer?: (payload: OppdaterPaameldingDetaljerForespørsel) => void;
  isDetaljerPending?: boolean;
  detaljerFeil?: string | null;
  isPending: boolean;
  serverFeil?: string | null;
};

export function PaameldingStatusDialog({
  open,
  onOpenChange,
  spillerNavn,
  spiller2Navn,
  erDobbel,
  gjeldendeSeed,
  brukere = [],
  onOppdaterSeed,
  onOppdaterDetaljer,
  isDetaljerPending,
  detaljerFeil,
  isPending,
  serverFeil,
}: Props) {
  const [seedVerdi, setSeedVerdi] = useState<string>(
    gjeldendeSeed != null ? String(gjeldendeSeed) : ""
  );
  const [spiller1NavnInput, setSpiller1NavnInput] = useState(spillerNavn);
  const [spiller2NavnInput, setSpiller2NavnInput] = useState(spiller2Navn ?? "");
  const [spiller1Modus, setSpiller1Modus] = useState<"manuell" | "bruker">("manuell");
  const [spiller2Modus, setSpiller2Modus] = useState<"manuell" | "bruker">("manuell");
  const [spiller1BrukerId, setSpiller1BrukerId] = useState("");
  const [spiller2BrukerId, setSpiller2BrukerId] = useState("");
  const [popover1Open, setPopover1Open] = useState(false);
  const [søkTekst1, setSøkTekst1] = useState("");
  const [popover2Open, setPopover2Open] = useState(false);
  const [søkTekst2, setSøkTekst2] = useState("");

  const spiller1Bruker = brukere.find((b) => b.id === spiller1BrukerId);
  const spiller2Bruker = brukere.find((b) => b.id === spiller2BrukerId);

  const filtrerteBrukere1 = søkTekst1.trim()
    ? brukere.filter((b) => {
        const q = søkTekst1.toLowerCase();
        return (
          (b.visningsnavn || b.epost).toLowerCase().includes(q) || b.epost.toLowerCase().includes(q)
        );
      })
    : brukere;

  const filtrerteBrukere2 = søkTekst2.trim()
    ? brukere.filter((b) => {
        const q = søkTekst2.toLowerCase();
        return (
          (b.visningsnavn || b.epost).toLowerCase().includes(q) || b.epost.toLowerCase().includes(q)
        );
      })
    : brukere;

  const parsedSeed = seedVerdi.trim() === "" ? null : Number(seedVerdi.trim());
  const seedEndret = parsedSeed !== (gjeldendeSeed ?? null);
  const detaljerEndret =
    spiller1BrukerId !== "" ||
    spiller2BrukerId !== "" ||
    spiller1NavnInput.trim() !== spillerNavn.trim() ||
    (!!erDobbel && spiller2NavnInput.trim() !== (spiller2Navn ?? "").trim());
  const kanLagre = seedEndret || detaljerEndret;

  function handleLagre() {
    if (!kanLagre) return;
    if (detaljerEndret && onOppdaterDetaljer) {
      const payload: OppdaterPaameldingDetaljerForespørsel = {};
      if (spiller1Modus === "bruker" && spiller1BrukerId) {
        payload.spiller1BrukerId = spiller1BrukerId;
      } else if (spiller1NavnInput.trim()) {
        payload.spiller1Navn = spiller1NavnInput.trim();
      }
      if (erDobbel) {
        if (spiller2Modus === "bruker" && spiller2BrukerId) {
          payload.spiller2BrukerId = spiller2BrukerId;
        } else if (spiller2NavnInput.trim()) {
          payload.spiller2Navn = spiller2NavnInput.trim();
        }
      }
      onOppdaterDetaljer(payload);
    }
    if (seedEndret && onOppdaterSeed) {
      onOppdaterSeed(parsedSeed);
    }
  }

  function handleClose(v: boolean) {
    if (!v) {
      setSeedVerdi(gjeldendeSeed != null ? String(gjeldendeSeed) : "");
      setSpiller1NavnInput(spillerNavn);
      setSpiller2NavnInput(spiller2Navn ?? "");
      setSpiller1Modus("manuell");
      setSpiller2Modus("manuell");
      setSpiller1BrukerId("");
      setSpiller2BrukerId("");
      setSøkTekst1("");
      setSøkTekst2("");
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Endre – {spillerNavn}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Spiller 1</Label>
              <div className="flex gap-0.5">
                <Button
                  type="button"
                  variant={spiller1Modus === "manuell" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setSpiller1Modus("manuell")}
                >
                  Manuell
                </Button>
                <Button
                  type="button"
                  variant={spiller1Modus === "bruker" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setSpiller1Modus("bruker")}
                >
                  Eksisterende
                </Button>
              </div>
            </div>
            {spiller1Modus === "bruker" ? (
              <Popover
                open={popover1Open}
                onOpenChange={(o) => {
                  setPopover1Open(o);
                  if (!o) setSøkTekst1("");
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popover1Open}
                    className="w-full justify-between font-normal"
                  >
                    {spiller1Bruker ? (
                      spiller1Bruker.visningsnavn || spiller1Bruker.epost
                    ) : (
                      <span className="text-muted-foreground">Velg bruker...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[300px]" align="start">
                  <div className="flex items-center gap-2 border-b px-3">
                    <Search className="h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      placeholder="Søk etter bruker..."
                      value={søkTekst1}
                      onChange={(e) => setSøkTekst1(e.target.value)}
                      className="border-0 p-0 shadow-none focus-visible:ring-0 h-10 text-sm"
                    />
                  </div>
                  <div className="max-h-[260px] overflow-y-auto p-1">
                    {filtrerteBrukere1.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        Ingen brukere funnet.
                      </p>
                    ) : (
                      filtrerteBrukere1.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setSpiller1BrukerId(b.id);
                            setPopover1Open(false);
                            setSøkTekst1("");
                          }}
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0",
                              b.id === spiller1BrukerId ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="truncate">{b.visningsnavn || b.epost}</span>
                            {b.visningsnavn && (
                              <span className="text-xs text-muted-foreground truncate">
                                {b.epost}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Input
                value={spiller1NavnInput}
                onChange={(e) => setSpiller1NavnInput(e.target.value)}
              />
            )}
          </div>

          {erDobbel && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Spiller 2 (valgfritt)</Label>
                <div className="flex gap-0.5">
                  <Button
                    type="button"
                    variant={spiller2Modus === "manuell" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setSpiller2Modus("manuell")}
                  >
                    Manuell
                  </Button>
                  <Button
                    type="button"
                    variant={spiller2Modus === "bruker" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setSpiller2Modus("bruker")}
                  >
                    Eksisterende
                  </Button>
                </div>
              </div>
              {spiller2Modus === "bruker" ? (
                <Popover
                  open={popover2Open}
                  onOpenChange={(o) => {
                    setPopover2Open(o);
                    if (!o) setSøkTekst2("");
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={popover2Open}
                      className="w-full justify-between font-normal"
                    >
                      {spiller2Bruker ? (
                        spiller2Bruker.visningsnavn || spiller2Bruker.epost
                      ) : (
                        <span className="text-muted-foreground">Velg bruker...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[300px]" align="start">
                    <div className="flex items-center gap-2 border-b px-3">
                      <Search className="h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Søk etter bruker..."
                        value={søkTekst2}
                        onChange={(e) => setSøkTekst2(e.target.value)}
                        className="border-0 p-0 shadow-none focus-visible:ring-0 h-10 text-sm"
                      />
                    </div>
                    <div className="max-h-[260px] overflow-y-auto p-1">
                      {filtrerteBrukere2.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                          Ingen brukere funnet.
                        </p>
                      ) : (
                        filtrerteBrukere2.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setSpiller2BrukerId(b.id);
                              setPopover2Open(false);
                              setSøkTekst2("");
                            }}
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground"
                          >
                            <Check
                              className={cn(
                                "h-4 w-4 shrink-0",
                                b.id === spiller2BrukerId ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="truncate">{b.visningsnavn || b.epost}</span>
                              {b.visningsnavn && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {b.epost}
                                </span>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Input
                  value={spiller2NavnInput}
                  onChange={(e) => setSpiller2NavnInput(e.target.value)}
                  placeholder="Tomt for å fjerne"
                />
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Seed (la stå tomt for å fjerne)</Label>
            <Input
              type="number"
              min={1}
              value={seedVerdi}
              onChange={(e) => setSeedVerdi(e.target.value)}
              placeholder="t.eks. 1"
            />
          </div>

          <ServerFeil feil={detaljerFeil ?? serverFeil ?? null} />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isPending || !!isDetaljerPending}
            >
              Avbryt
            </Button>
            <Button onClick={handleLagre} disabled={!kanLagre || isPending || !!isDetaljerPending}>
              {isPending || isDetaljerPending ? "Lagrer..." : "Lagre"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
