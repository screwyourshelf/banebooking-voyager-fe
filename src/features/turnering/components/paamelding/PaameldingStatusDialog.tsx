import { Dialog, Form } from "@/components";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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
    <Dialog
      open={open}
      onOpenChange={handleClose}
      title={`Endre – ${spillerNavn}`}
      actions={
        <>
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
        </>
      }
    >
      <Form.Fields>
        <Form.Field label="Spiller 1">
          <div>
            <div>
              <Button
                type="button"
                variant={spiller1Modus === "manuell" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSpiller1Modus("manuell")}
              >
                Manuell
              </Button>
              <Button
                type="button"
                variant={spiller1Modus === "bruker" ? "secondary" : "ghost"}
                size="sm"
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
                <Button variant="outline" role="combobox" aria-expanded={popover1Open}>
                  {spiller1Bruker ? (
                    spiller1Bruker.visningsnavn || spiller1Bruker.epost
                  ) : (
                    <span>Velg bruker...</span>
                  )}
                  <ChevronsUpDown />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <div>
                  <Search />
                  <Input
                    placeholder="Søk etter bruker..."
                    value={søkTekst1}
                    onChange={(e) => setSøkTekst1(e.target.value)}
                  />
                </div>
                <div>
                  {filtrerteBrukere1.length === 0 ? (
                    <p>Ingen brukere funnet.</p>
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
                      >
                        <Check data-selected={b.id === spiller1BrukerId} />
                        <div>
                          <span>{b.visningsnavn || b.epost}</span>
                          {b.visningsnavn && <span>{b.epost}</span>}
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
        </Form.Field>

        {erDobbel && (
          <Form.Field label="Spiller 2" description="Valgfritt">
            <div>
              <div>
                <Button
                  type="button"
                  variant={spiller2Modus === "manuell" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSpiller2Modus("manuell")}
                >
                  Manuell
                </Button>
                <Button
                  type="button"
                  variant={spiller2Modus === "bruker" ? "secondary" : "ghost"}
                  size="sm"
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
                  <Button variant="outline" role="combobox" aria-expanded={popover2Open}>
                    {spiller2Bruker ? (
                      spiller2Bruker.visningsnavn || spiller2Bruker.epost
                    ) : (
                      <span>Velg bruker...</span>
                    )}
                    <ChevronsUpDown />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start">
                  <div>
                    <Search />
                    <Input
                      placeholder="Søk etter bruker..."
                      value={søkTekst2}
                      onChange={(e) => setSøkTekst2(e.target.value)}
                    />
                  </div>
                  <div>
                    {filtrerteBrukere2.length === 0 ? (
                      <p>Ingen brukere funnet.</p>
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
                        >
                          <Check data-selected={b.id === spiller2BrukerId} />
                          <div>
                            <span>{b.visningsnavn || b.epost}</span>
                            {b.visningsnavn && <span>{b.epost}</span>}
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
          </Form.Field>
        )}

        <Form.Field label="Seed" description="La feltet stå tomt for å fjerne seedingen.">
          <Input
            type="number"
            min={1}
            value={seedVerdi}
            onChange={(e) => setSeedVerdi(e.target.value)}
            placeholder="t.eks. 1"
          />
        </Form.Field>

        <ServerFeil feil={detaljerFeil ?? serverFeil ?? null} />
      </Form.Fields>
    </Dialog>
  );
}
