import type { ReactNode } from "react";
import { Ban, CalendarDays, Tag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RecordAccordionCard,
  RecordCardActions,
  RecordCardDetails,
  RecordCardTrigger,
  RecordDetailGrid,
  RecordDetailItem,
  RecordDetailsLayout,
  RecordEyebrow,
  RecordIdentity,
  RecordLinkButton,
  RecordStatus,
} from "@/components/records";
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

function hentInitialer(bruker: BrukerRespons) {
  const navn = bruker.visningsnavn?.trim() || bruker.fulltNavn?.trim();
  if (navn) {
    return navn
      .split(/\s+/)
      .slice(0, 2)
      .map((del) => del[0])
      .join("")
      .toLocaleUpperCase("nb-NO");
  }

  return bruker.epost?.slice(0, 2).toLocaleUpperCase("nb-NO") || "?";
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

  return (
    <RecordAccordionCard value={bruker.id} muted={slettet}>
      <RecordCardTrigger>
        <RecordIdentity
          leading={<span aria-hidden="true">{hentInitialer(bruker)}</span>}
          title={
            <>
              <span title={hovednavn || bruker.epost}>{hovednavn || "Ukjent bruker"}</span>
              {erDeg ? <RecordStatus tone="own">Deg</RecordStatus> : null}
            </>
          }
          description={visEpost ? <span title={bruker.epost}>{bruker.epost}</span> : undefined}
          meta={
            <>
              <RecordEyebrow>{formaterRolle(rolle)}</RecordEyebrow>
              <span>{opprettetTekst}</span>
              {kontoStatus !== "aktiv" ? (
                <RecordStatus tone={kontoStatus === "sperret" ? "warning" : "past"}>
                  {kontoStatusTekst}
                </RecordStatus>
              ) : null}
            </>
          }
        />
      </RecordCardTrigger>

      <RecordCardDetails>
        <RecordDetailsLayout>
          <RecordDetailGrid>
            <RecordDetailItem icon={<CalendarDays aria-hidden="true" />} label="Opprettet">
              {bruker.opprettetTid ? formatDatoKort(bruker.opprettetTid) : "Ikke tilgjengelig"}
            </RecordDetailItem>

            <RecordDetailItem icon={<UserRound aria-hidden="true" />} label="Visningsnavn">
              {bruker.visningsnavn || "Ikke satt"}
            </RecordDetailItem>

            <RecordDetailItem icon={<Tag aria-hidden="true" />} label="Medlemskap">
              {bruker.medlemskapType
                ? formaterMedlemskapType(bruker.medlemskapType)
                : medlemskapTekst}
              {bruker.medlemskapBekreftetDato
                ? ` · ${formatDatoKort(bruker.medlemskapBekreftetDato)}`
                : null}
            </RecordDetailItem>

            {bruker.fulltNavn ? (
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

          {kanRedigere && erKlubbAdmin ? (
            <RecordCardActions>
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
            </RecordCardActions>
          ) : null}
        </RecordDetailsLayout>
      </RecordCardDetails>
    </RecordAccordionCard>
  );
}
