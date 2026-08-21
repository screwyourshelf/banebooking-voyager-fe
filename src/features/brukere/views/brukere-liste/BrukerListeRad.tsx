import type { ReactNode } from "react";
import { Ban, Tag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RecordDetailGrid,
  RecordDetailItem,
  RecordLinkButton,
  RecordStatus,
} from "@/components/records";
import { Collection } from "@/components";
import type { BrukerRespons, RolleType } from "@/features/brukere/types";
import { formaterMedlemskapType, formaterRolle } from "@/utils/brukerPresentation";
import { formatDatoKort } from "@/utils/datoUtils";

type Props = {
  bruker: BrukerRespons;
  currentBrukerId: string | undefined;
  erKlubbAdmin: boolean;
  onRedigerBruker: (bruker: BrukerRespons) => void;
  renderSlettAction?: (bruker: BrukerRespons) => ReactNode;
  renderSperrAction?: (bruker: BrukerRespons) => ReactNode;
  onÅpneSperreHistorikk?: (bruker: BrukerRespons) => void;
};

function erSlettetEpost(epost?: string | null) {
  return !!epost?.toLowerCase().startsWith("slettet_");
}

export default function BrukerListeRad({
  bruker,
  currentBrukerId,
  erKlubbAdmin,
  onRedigerBruker,
  renderSlettAction,
  renderSperrAction,
  onÅpneSperreHistorikk,
}: Props) {
  const slettet = erSlettetEpost(bruker.epost);
  const rolle = (bruker.roller?.[0] ?? "Medlem") as RolleType;
  const erDeg = bruker.id === currentBrukerId;
  const kanRedigere = !erDeg && !slettet;

  const hovednavn = bruker.visningsnavn?.trim() || bruker.fulltNavn?.trim() || bruker.epost;
  const visEpost = hovednavn !== bruker.epost;

  const medlemskapTekst = bruker.medlemskapBekreftetDato ? "Bekreftet" : "Ikke bekreftet";
  const opprettetTekst = bruker.opprettetTid
    ? `Opprettet ${formatDatoKort(bruker.opprettetTid)}`
    : "Opprettet dato mangler";

  const kontoStatus = slettet ? "slettet" : bruker.erSperret ? "sperret" : "aktiv";
  const kontoStatusTekst = slettet ? "Slettet" : bruker.erSperret ? "Sperret" : "Aktiv";
  const visMedlemsnavn =
    !!bruker.visningsnavn?.trim() &&
    !!bruker.fulltNavn?.trim() &&
    bruker.visningsnavn.trim() !== bruker.fulltNavn.trim();
  const details = (
    <RecordDetailGrid>
      <RecordDetailItem icon={<Tag aria-hidden="true" />} label="Medlemskap">
        {bruker.medlemskapType ? formaterMedlemskapType(bruker.medlemskapType) : medlemskapTekst}
        {bruker.medlemskapBekreftetDato
          ? ` · ${formatDatoKort(bruker.medlemskapBekreftetDato)}`
          : null}
      </RecordDetailItem>

      {visMedlemsnavn ? (
        <RecordDetailItem icon={<UserRound aria-hidden="true" />} label="Navn i medlemskapet">
          {bruker.fulltNavn}
        </RecordDetailItem>
      ) : null}

      {bruker.antallAktiveSperrer !== undefined ? (
        <RecordDetailItem icon={<Ban aria-hidden="true" />} label="Sperrehistorikk">
          {onÅpneSperreHistorikk ? (
            <RecordLinkButton onClick={() => onÅpneSperreHistorikk(bruker)}>
              {bruker.antallAktiveSperrer === 0
                ? "Ingen aktive sperrer"
                : `${bruker.antallAktiveSperrer} aktive sperrer`}
            </RecordLinkButton>
          ) : bruker.antallAktiveSperrer === 0 ? (
            "Ingen aktive sperrer"
          ) : (
            `${bruker.antallAktiveSperrer} aktive sperrer`
          )}
        </RecordDetailItem>
      ) : null}
    </RecordDetailGrid>
  );
  const actions =
    kanRedigere && erKlubbAdmin ? (
      <>
        <Button
          type="button"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onRedigerBruker(bruker);
          }}
        >
          Rediger
        </Button>
        {renderSperrAction?.(bruker)}
        {renderSlettAction?.(bruker)}
      </>
    ) : undefined;

  return (
    <Collection.Row
      muted={slettet}
      title={<span title={hovednavn || bruker.epost}>{hovednavn || "Ukjent bruker"}</span>}
      context={erDeg ? <RecordStatus tone="own">Deg</RecordStatus> : undefined}
      description={visEpost ? <span title={bruker.epost}>{bruker.epost}</span> : undefined}
      meta={`${formaterRolle(rolle)} · ${opprettetTekst}`}
      status={
        kontoStatus !== "aktiv"
          ? {
              label: kontoStatusTekst,
              tone: kontoStatus === "sperret" ? "warning" : "past",
            }
          : undefined
      }
      interaction={{ type: "expand", value: bruker.id, details, actions }}
    />
  );
}
