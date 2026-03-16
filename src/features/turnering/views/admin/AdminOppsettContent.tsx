import { useState } from "react";
import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
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
    <div className="space-y-4">
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
          <p className="text-sm text-muted-foreground italic">Ingen klasser lagt til.</p>
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
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onRedigerKlasse(k)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFjernKlasse(k.id)}
                          disabled={fjernKlassePending}
                        >
                          <Trash2 className="h-4 w-4" />
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
                    <UserMinus className="h-4 w-4" />
                  </Button>
                }
              />
            ))}
            <Row title="Legg til ansvarlig">
              <div className="flex gap-2">
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
                      className="flex-1 justify-between font-normal"
                    >
                      {valgtBruker ? (
                        valgtBruker.visningsnavn || valgtBruker.epost
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
                        value={søkTekst}
                        onChange={(e) => setSøkTekst(e.target.value)}
                        className="border-0 p-0 shadow-none focus-visible:ring-0 h-10 text-sm"
                      />
                    </div>
                    <div className="max-h-[260px] overflow-y-auto p-1">
                      {filtrerteBrukere.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                          Ingen brukere funnet.
                        </p>
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
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground"
                          >
                            <Check
                              className={cn(
                                "h-4 w-4 shrink-0",
                                b.id === valgtBrukerId ? "opacity-100" : "opacity-0"
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onLeggTilAnsvarlig}
                  disabled={leggTilAnsvarligPending || !valgtBrukerId}
                >
                  <UserPlus className="h-4 w-4" />
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
