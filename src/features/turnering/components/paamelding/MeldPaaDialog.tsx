import { Dialog, Form } from "@/components";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import type { KlasseType, MeldPaaKlasseForespørsel, BrukerRespons } from "@/types";
import { ServerFeil } from "@/components/errors";

const DOBBEL_KLASSER: KlasseType[] = ["HerreDobbel", "DameDobbel", "MixedDobbel", "JuniorDobbel"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  klasseType: KlasseType;
  erAdmin: boolean;
  onMeldPaa: (payload: MeldPaaKlasseForespørsel, seed?: number | null) => void;
  isPending: boolean;
  serverFeil?: string | null;
  brukere?: BrukerRespons[];
};

export function MeldPaaDialog({
  open,
  onOpenChange,
  klasseType,
  erAdmin,
  onMeldPaa,
  isPending,
  serverFeil,
  brukere = [],
}: Props) {
  const erDobbel = DOBBEL_KLASSER.includes(klasseType);

  const [manuellMakkerNavn, setManuellMakkerNavn] = useState("");
  const [manuellMakkerEpost, setManuellMakkerEpost] = useState("");

  const [spiller1Modus, setSpiller1Modus] = useState<"manuell" | "bruker">("manuell");
  const [spiller2Modus, setSpiller2Modus] = useState<"manuell" | "bruker">("manuell");
  const [adminSpiller1Navn, setAdminSpiller1Navn] = useState("");
  const [adminSpiller2Navn, setAdminSpiller2Navn] = useState("");
  const [adminSeed, setAdminSeed] = useState<string>("");
  const [adminSpiller1BrukerId, setAdminSpiller1BrukerId] = useState("");
  const [adminSpiller2BrukerId, setAdminSpiller2BrukerId] = useState("");
  const [popover1Open, setPopover1Open] = useState(false);
  const [søkTekst1, setSøkTekst1] = useState("");
  const [popover2Open, setPopover2Open] = useState(false);
  const [søkTekst2, setSøkTekst2] = useState("");

  const spiller1Bruker = brukere.find((b) => b.id === adminSpiller1BrukerId);
  const spiller2Bruker = brukere.find((b) => b.id === adminSpiller2BrukerId);

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

  const isSubmitDisabled =
    isPending ||
    (erAdmin && spiller1Modus === "manuell" && !adminSpiller1Navn.trim()) ||
    (erAdmin && spiller1Modus === "bruker" && !adminSpiller1BrukerId) ||
    (!erAdmin && erDobbel && !manuellMakkerNavn.trim());

  function handleMeldPaa() {
    const parsedSeed = adminSeed.trim() === "" ? null : Number(adminSeed.trim());
    if (erAdmin) {
      const payload: MeldPaaKlasseForespørsel = {};
      if (spiller1Modus === "bruker" && adminSpiller1BrukerId) {
        payload.spiller1BrukerId = adminSpiller1BrukerId;
      } else if (adminSpiller1Navn) {
        payload.spiller1Navn = adminSpiller1Navn;
      }
      if (erDobbel) {
        if (spiller2Modus === "bruker" && adminSpiller2BrukerId) {
          payload.spiller2BrukerId = adminSpiller2BrukerId;
        } else if (adminSpiller2Navn) {
          payload.spiller2Navn = adminSpiller2Navn;
        }
      }
      onMeldPaa(payload, parsedSeed);
    } else if (erDobbel && manuellMakkerNavn) {
      const payload: MeldPaaKlasseForespørsel = { spiller2Navn: manuellMakkerNavn };
      if (manuellMakkerEpost) payload.spiller2Epost = manuellMakkerEpost;
      onMeldPaa(payload);
    } else {
      onMeldPaa({});
    }
  }

  function handleClose(v: boolean) {
    if (!v) {
      setManuellMakkerNavn("");
      setManuellMakkerEpost("");
      setSpiller1Modus("manuell");
      setSpiller2Modus("manuell");
      setAdminSpiller1Navn("");
      setAdminSpiller2Navn("");
      setAdminSeed("");
      setAdminSpiller1BrukerId("");
      setAdminSpiller2BrukerId("");
      setSøkTekst1("");
      setSøkTekst2("");
    }
    onOpenChange(v);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      title="Meld på"
      description={
        erAdmin ? "Registrer deltaker" : erDobbel ? "Legg til makker" : "Bekreft påmelding"
      }
      actions={
        <>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Avbryt
          </Button>
          <Button onClick={handleMeldPaa} disabled={isSubmitDisabled}>
            {isPending ? "Melder på..." : "Meld på"}
          </Button>
        </>
      }
    >
      <Form.Fields>
        {erAdmin ? (
          <>
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
                              setAdminSpiller1BrukerId(b.id);
                              setPopover1Open(false);
                              setSøkTekst1("");
                            }}
                          >
                            <Check data-selected={b.id === adminSpiller1BrukerId} />
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
                  value={adminSpiller1Navn}
                  onChange={(e) => setAdminSpiller1Navn(e.target.value)}
                  placeholder="Fullt navn"
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
                                setAdminSpiller2BrukerId(b.id);
                                setPopover2Open(false);
                                setSøkTekst2("");
                              }}
                            >
                              <Check data-selected={b.id === adminSpiller2BrukerId} />
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
                    value={adminSpiller2Navn}
                    onChange={(e) => setAdminSpiller2Navn(e.target.value)}
                    placeholder="Fullt navn"
                  />
                )}
              </Form.Field>
            )}

            <Form.Field label="Seed" description="Valgfritt">
              <Input
                type="number"
                min={1}
                value={adminSeed}
                onChange={(e) => setAdminSeed(e.target.value)}
                placeholder="t.eks. 1"
              />
            </Form.Field>
          </>
        ) : erDobbel ? (
          <>
            <Form.Field label="Makkerens navn">
              <Input
                value={manuellMakkerNavn}
                onChange={(e) => setManuellMakkerNavn(e.target.value)}
                placeholder="Fullt navn"
              />
            </Form.Field>
            <Form.Field label="Makkerens e-post" description="Valgfritt">
              <Input
                type="email"
                value={manuellMakkerEpost}
                onChange={(e) => setManuellMakkerEpost(e.target.value)}
                placeholder="epost@eksempel.no"
              />
            </Form.Field>
          </>
        ) : (
          <p>Bekreft at du vil melde deg på klassen.</p>
        )}

        <ServerFeil feil={serverFeil ?? null} />
      </Form.Fields>
    </Dialog>
  );
}
