import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServerFeil } from "@/components/errors";
import { TurneringHeaderSection, LeggTilKlasseDialog, klasseTypeNavn } from "../../components";
import { STATUS_LABELS } from "./adminStatusUtils";
import { Trash2, UserMinus, UserPlus } from "lucide-react";
import type {
  TurneringRespons,
  KlasseType,
  TurneringStatus,
  TurneringAnsvarligRespons,
  LeggTilKlasseForespørsel,
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
  ansvarlige: TurneringAnsvarligRespons[];
  fjernAnsvarligError: string | null;
  onFjernAnsvarlig: (brukerId: string) => void;
  fjernAnsvarligPending: boolean;
  leggTilAnsvarligError: string | null;
  onLeggTilAnsvarlig: () => void;
  leggTilAnsvarligPending: boolean;
  nyAnsvarligBrukerId: string;
  onNyAnsvarligBrukerIdChange: (value: string) => void;
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
  ansvarlige,
  fjernAnsvarligError,
  onFjernAnsvarlig,
  fjernAnsvarligPending,
  leggTilAnsvarligError,
  onLeggTilAnsvarlig,
  leggTilAnsvarligPending,
  nyAnsvarligBrukerId,
  onNyAnsvarligBrukerIdChange,
}: Props) {
  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <TurneringHeaderSection
        tittel={turnering.arrangementTittel}
        status={turnering.status}
        beskrivelse={turnering.arrangementBeskrivelse}
        startDato={turnering.arrangementStartDato}
        sluttDato={turnering.arrangementSluttDato}
        actions={
          neste ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onNesteStatus}
              disabled={nesteStatusPending}
            >
              {nesteStatusPending ? "Oppdaterer..." : `Sett til «${STATUS_LABELS[neste]}»`}
            </Button>
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
                    description={`${k.antallGodkjente} godkjent · ${k.antallSokt} søkt · ${k.antallReserve} reserve${k.foreslåttStartTid ? ` · Starter ${format(parseISO(k.foreslåttStartTid), "d. MMM 'kl.' HH:mm", { locale: nb })}` : ""}`}
                    right={
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFjernKlasse(k.id)}
                        disabled={fjernKlassePending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                <Input
                  type="text"
                  value={nyAnsvarligBrukerId}
                  onChange={(e) => onNyAnsvarligBrukerIdChange(e.target.value)}
                  placeholder="Bruker-ID"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onLeggTilAnsvarlig}
                  disabled={leggTilAnsvarligPending || !nyAnsvarligBrukerId.trim()}
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
    </div>
  );
}
