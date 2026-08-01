import type { ReactNode } from "react";
import { Ban, CalendarDays, Tag, UserRound } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RecordEyebrow } from "@/components/records";
import type { BrukerRespons, RolleType } from "@/features/brukere/types";

const MEDLEMSKAP_TYPE_LABELS: Record<string, string> = {
  BarnJunior: "Barn/junior (inntil 19 år)",
  StudentVernepliktig: "Student/vernepliktig",
  Voksen: "Voksen",
  Familie: "Familiemedlemskap",
};

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

function formatDato(dato?: string | null) {
  if (!dato) return null;
  return new Date(dato).toLocaleDateString("nb-NO");
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

  const medlemskapStatus = bruker.medlemskapBekreftetDato ? "bekreftet" : "mangler";
  const medlemskapTekst = bruker.medlemskapBekreftetDato ? "Bekreftet" : "Ikke bekreftet";

  const kontoStatus = slettet ? "slettet" : bruker.erSperret ? "sperret" : "aktiv";
  const kontoStatusTekst = slettet ? "Slettet" : bruker.erSperret ? "Sperret" : "Aktiv";

  return (
    <AccordionItem
      value={bruker.id}
      className="record-card user-directory-row"
      data-account-status={kontoStatus}
    >
      <AccordionTrigger className="record-card__trigger user-directory-row__trigger hover:no-underline">
        <div className="user-directory-row__summary">
          <div className="user-directory-row__identity">
            <span className="user-directory-row__avatar" aria-hidden="true">
              {hentInitialer(bruker)}
            </span>
            <span className="user-directory-row__identity-copy">
              <span className="user-directory-row__name-line">
                <span className="user-directory-row__name" title={hovednavn || bruker.epost}>
                  {hovednavn || "Ukjent bruker"}
                </span>
                {erDeg ? <span className="user-directory-row__self">Deg</span> : null}
              </span>
              {visEpost ? (
                <span className="user-directory-row__email" title={bruker.epost}>
                  {bruker.epost}
                </span>
              ) : null}
              <span className="user-directory-row__mobile-meta">
                <RecordEyebrow className="user-directory-row__mobile-role">{rolle}</RecordEyebrow>
                <span data-membership-status={medlemskapStatus}>{medlemskapTekst}</span>
                {kontoStatus !== "aktiv" ? (
                  <span data-account-status={kontoStatus}>{kontoStatusTekst}</span>
                ) : null}
              </span>
            </span>
          </div>

          <RecordEyebrow className="user-directory-row__cell user-directory-row__role">
            {rolle}
          </RecordEyebrow>
          <span
            className="user-directory-row__cell user-directory-row__membership"
            data-membership-status={medlemskapStatus}
          >
            <i aria-hidden="true" />
            {medlemskapTekst}
          </span>
          <span
            className="user-directory-row__cell user-directory-row__account-status"
            data-account-status={kontoStatus}
          >
            <i aria-hidden="true" />
            {kontoStatusTekst}
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent className="user-directory-row__details">
        <dl className="user-directory-row__detail-grid">
          <div>
            <dt>
              <CalendarDays aria-hidden="true" />
              Opprettet
            </dt>
            <dd>{formatDato(bruker.opprettetTid) ?? "Ikke tilgjengelig"}</dd>
          </div>

          <div>
            <dt>
              <UserRound aria-hidden="true" />
              Visningsnavn
            </dt>
            <dd>{bruker.visningsnavn || "Ikke satt"}</dd>
          </div>

          <div>
            <dt>
              <Tag aria-hidden="true" />
              Medlemskap
            </dt>
            <dd>
              {bruker.medlemskapType
                ? (MEDLEMSKAP_TYPE_LABELS[bruker.medlemskapType] ?? bruker.medlemskapType)
                : medlemskapTekst}
              {bruker.medlemskapBekreftetDato
                ? ` · ${formatDato(bruker.medlemskapBekreftetDato)}`
                : null}
            </dd>
          </div>

          {bruker.fulltNavn ? (
            <div>
              <dt>
                <UserRound aria-hidden="true" />
                Navn i medlemskapet
              </dt>
              <dd>{bruker.fulltNavn}</dd>
            </div>
          ) : null}

          {bruker.antallAktiveSperrer !== undefined ? (
            <div>
              <dt>
                <Ban aria-hidden="true" />
                Sperrehistorikk
              </dt>
              <dd>
                {onÅpneSperreHistorikk ? (
                  <button
                    type="button"
                    className="user-directory-row__history-link"
                    onClick={(event) => {
                      event.stopPropagation();
                      onÅpneSperreHistorikk(bruker);
                    }}
                  >
                    {bruker.antallAktiveSperrer === 0
                      ? "Ingen aktive sperrer"
                      : `${bruker.antallAktiveSperrer} aktive sperrer`}
                  </button>
                ) : bruker.antallAktiveSperrer === 0 ? (
                  "Ingen aktive sperrer"
                ) : (
                  `${bruker.antallAktiveSperrer} aktive sperrer`
                )}
              </dd>
            </div>
          ) : null}
        </dl>

        {kanRedigere && erKlubbAdmin ? (
          <div className="user-directory-row__actions">
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
          </div>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  );
}
