import { useState } from "react";
import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServerFeil } from "@/components/errors";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    <div className="app-stack app-stack--lg">
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
      <PageSection
        title="Klasser"
        actions={
          <Button size="sm" onClick={() => onLeggTilKlasseOpen(true)}>
            Legg til klasse
          </Button>
        }
      >
        {turnering.klasser.length === 0 ? (
          <p className="app-text-empty">Ingen klasser lagt til.</p>
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
                      <div className="app-inline app-inline--tight">
                        <Button variant="ghost" size="sm" onClick={() => onRedigerKlasse(k)}>
                          <Pencil className="app-icon-sm" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFjernKlasse(k.id)}
                          disabled={fjernKlassePending}
                        >
                          <Trash2 className="app-icon-sm" />
                        </Button>
                      </div>
                    }
                  />
                ))}
              </RowList>
            </RowPanel>
          </>
        )}
      </PageSection>

      {/* ─── Resultatansvarlige ─── */}
      <PageSection title="Resultatansvarlige">
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
                    size="sm"
                    onClick={() => onFjernAnsvarlig(a.brukerId)}
                    disabled={fjernAnsvarligPending}
                  >
                    <UserMinus className="app-icon-sm" />
                  </Button>
                }
              />
            ))}
            <Row title="Legg til ansvarlig">
              <div className="app-inline">
                <Popover
                  open={open}
                  onOpenChange={(o) => {
                    setOpen(o);
                    if (!o) setSøkTekst("");
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="app-combobox-trigger app-flex-1"
                    >
                      {valgtBruker ? (
                        valgtBruker.visningsnavn || valgtBruker.epost
                      ) : (
                        <span className="app-text-muted">Velg bruker...</span>
                      )}
                      <ChevronsUpDown className="app-icon-sm app-icon-muted" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="app-combobox-popover" align="start">
                    <div className="app-combobox-search">
                      <Search className="app-icon-sm app-icon-muted" />
                      <Input
                        placeholder="Søk etter bruker..."
                        value={søkTekst}
                        onChange={(e) => setSøkTekst(e.target.value)}
                        className="app-combobox-input"
                      />
                    </div>
                    <div className="app-combobox-list">
                      {filtrerteBrukere.length === 0 ? (
                        <p className="app-combobox-empty">Ingen brukere funnet.</p>
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
                            className="app-combobox-option"
                          >
                            <Check
                              className="app-combobox-check"
                              data-selected={b.id === valgtBrukerId}
                            />
                            <div className="app-combobox-copy">
                              <span className="app-text-truncate">{b.visningsnavn || b.epost}</span>
                              {b.visningsnavn && (
                                <span className="app-text-caption app-text-truncate">
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onLeggTilAnsvarlig}
                  disabled={leggTilAnsvarligPending || !valgtBrukerId}
                >
                  <UserPlus className="app-icon-sm" />
                </Button>
              </div>
            </Row>
          </RowList>
        </RowPanel>
      </PageSection>

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
