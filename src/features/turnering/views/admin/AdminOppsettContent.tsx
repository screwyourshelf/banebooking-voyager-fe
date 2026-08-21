import { useState } from "react";
import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServerFeil } from "@/components/errors";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Section } from "@/components";
import {
  TurneringHeaderSection,
  LeggTilKlasseDialog,
  OppdaterKlasseStrukturDialog,
  klasseTypeNavn,
} from "../../components";
import { NesteStatusKnapp } from "./NesteStatusKnapp";
import { Check, ChevronsUpDown, Pencil, Search, Trash2, UserMinus, UserPlus } from "lucide-react";
import type {
  TurneringRespons,
  TurneringKlasseRespons,
  KlasseType,
  TurneringStatus,
  TurneringAnsvarligRespons,
  LeggTilKlasseForespørsel,
  OppdaterKlasseStrukturForespørsel,
  BrukerRespons,
} from "@/types";

type Props = {
  turnering: TurneringRespons;
  eksisterendeKlasseTyper: KlasseType[];
  neste: TurneringStatus | null;
  onNesteStatus: () => void;
  nesteStatusPending: boolean;
  fjernKlasseError: string | null;
  onFjernKlasse: (klasseId: string) => void;
  fjernKlassePending: boolean;
  leggTilKlasseOpen: boolean;
  onLeggTilKlasseOpen: (open: boolean) => void;
  onLeggTilKlasse: (payload: LeggTilKlasseForespørsel) => void;
  leggTilKlassePending: boolean;
  leggTilKlasseError: string | null;
  redigerKlasse: TurneringKlasseRespons | null;
  onRedigerKlasse: (klasse: TurneringKlasseRespons | null) => void;
  onOppdaterKlasseStruktur: (payload: OppdaterKlasseStrukturForespørsel) => void;
  oppdaterKlasseStrukturPending: boolean;
  oppdaterKlasseStrukturError: string | null;
  ansvarlige: TurneringAnsvarligRespons[];
  fjernAnsvarligError: string | null;
  onFjernAnsvarlig: (brukerId: string) => void;
  fjernAnsvarligPending: boolean;
  leggTilAnsvarligError: string | null;
  onLeggTilAnsvarlig: () => void;
  leggTilAnsvarligPending: boolean;
  brukere: BrukerRespons[];
  valgtBrukerId: string;
  onVelgBrukerIdChange: (id: string) => void;
};

export default function AdminOppsettContent({
  turnering,
  eksisterendeKlasseTyper,
  neste,
  onNesteStatus,
  nesteStatusPending,
  fjernKlasseError,
  onFjernKlasse,
  fjernKlassePending,
  leggTilKlasseOpen,
  onLeggTilKlasseOpen,
  onLeggTilKlasse,
  leggTilKlassePending,
  leggTilKlasseError,
  redigerKlasse,
  onRedigerKlasse,
  onOppdaterKlasseStruktur,
  oppdaterKlasseStrukturPending,
  oppdaterKlasseStrukturError,
  ansvarlige,
  fjernAnsvarligError,
  onFjernAnsvarlig,
  fjernAnsvarligPending,
  leggTilAnsvarligError,
  onLeggTilAnsvarlig,
  leggTilAnsvarligPending,
  brukere,
  valgtBrukerId,
  onVelgBrukerIdChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [søkTekst, setSøkTekst] = useState("");

  const filtrerteBrukere = søkTekst.trim()
    ? brukere.filter((b) => {
        const q = søkTekst.toLowerCase();
        const navn = (b.visningsnavn || b.epost).toLowerCase();
        return navn.includes(q) || b.epost.toLowerCase().includes(q);
      })
    : brukere;

  const valgtBruker = brukere.find((b) => b.id === valgtBrukerId);
  return (
    <div>
      {/* ─── Header ─── */}
      <TurneringHeaderSection
        tittel={turnering.arrangementTittel}
        status={turnering.status}
        startDato={turnering.arrangementStartDato}
        sluttDato={turnering.arrangementSluttDato}
        actions={
          neste ? (
            <NesteStatusKnapp
              neste={neste}
              onNesteStatus={onNesteStatus}
              pending={nesteStatusPending}
            />
          ) : undefined
        }
      />

      {/* ─── Klasser ─── */}
      <Section
        title="Klasser"
        actions={<Button onClick={() => onLeggTilKlasseOpen(true)}>Legg til klasse</Button>}
      >
        {turnering.klasser.length === 0 ? (
          <p>Ingen klasser lagt til.</p>
        ) : (
          <>
            <ServerFeil feil={fjernKlasseError} />
            <RowPanel>
              <RowList>
                {turnering.klasser.map((k) => (
                  <Row
                    key={k.id}
                    title={klasseTypeNavn(k.klasseType)}
                    description={`${k.antallPaameldte} påmeldt${k.foreslåttStartTid ? ` · Starter ${format(parseISO(k.foreslåttStartTid), "d. MMM 'kl.' HH:mm", { locale: nb })}` : ""}`}
                    right={
                      <div>
                        <Button variant="ghost" onClick={() => onRedigerKlasse(k)}>
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => onFjernKlasse(k.id)}
                          disabled={fjernKlassePending}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    }
                  />
                ))}
              </RowList>
            </RowPanel>
          </>
        )}
      </Section>

      {/* ─── Resultatansvarlige ─── */}
      <Section title="Resultatansvarlige">
        <ServerFeil feil={fjernAnsvarligError ?? leggTilAnsvarligError} />
        <RowPanel>
          <RowList>
            {ansvarlige.map((a) => (
              <Row
                key={a.brukerId}
                title={a.navn}
                description={a.epost}
                right={
                  <Button
                    variant="ghost"
                    onClick={() => onFjernAnsvarlig(a.brukerId)}
                    disabled={fjernAnsvarligPending}
                  >
                    <UserMinus />
                  </Button>
                }
              />
            ))}
            <Row title="Legg til ansvarlig">
              <div>
                <Popover
                  open={open}
                  onOpenChange={(o) => {
                    setOpen(o);
                    if (!o) setSøkTekst("");
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open}>
                      {valgtBruker ? (
                        valgtBruker.visningsnavn || valgtBruker.epost
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
                        value={søkTekst}
                        onChange={(e) => setSøkTekst(e.target.value)}
                      />
                    </div>
                    <div>
                      {filtrerteBrukere.length === 0 ? (
                        <p>Ingen brukere funnet.</p>
                      ) : (
                        filtrerteBrukere.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              onVelgBrukerIdChange(b.id);
                              setOpen(false);
                              setSøkTekst("");
                            }}
                          >
                            <Check data-selected={b.id === valgtBrukerId} />
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
                <Button
                  variant="outline"
                  onClick={onLeggTilAnsvarlig}
                  disabled={leggTilAnsvarligPending || !valgtBrukerId}
                >
                  <UserPlus />
                </Button>
              </div>
            </Row>
          </RowList>
        </RowPanel>
      </Section>

      {/* ─── Dialog ─── */}
      <LeggTilKlasseDialog
        open={leggTilKlasseOpen}
        onOpenChange={onLeggTilKlasseOpen}
        eksisterendeKlasser={eksisterendeKlasseTyper}
        onLeggTil={onLeggTilKlasse}
        isPending={leggTilKlassePending}
        serverFeil={leggTilKlasseError}
      />

      {redigerKlasse && (
        <OppdaterKlasseStrukturDialog
          open={!!redigerKlasse}
          onOpenChange={(v) => {
            if (!v) onRedigerKlasse(null);
          }}
          klasse={redigerKlasse}
          onOppdater={onOppdaterKlasseStruktur}
          isPending={oppdaterKlasseStrukturPending}
          serverFeil={oppdaterKlasseStrukturError}
        />
      )}
    </div>
  );
}
