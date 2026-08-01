import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RecordAccent, RecordStatus } from "@/components/records";
import { SlettArrangementDialog } from "@/features/arrangement-admin/components";
import type { ArrangementRespons, DagMedSlotsRespons } from "@/types";
import { dagerIgjenTekst } from "@/utils/datoUtils";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

type Props = {
  arrangement: ArrangementRespons;
  onAvlys: (arrangement: ArrangementRespons) => Promise<unknown>;
};

const TURNERING_STATUS_TEKST: Record<string, string> = {
  Oppsett: "Påmelding åpner snart",
  PaameldingAapen: "Påmelding åpen",
  Pagaar: "Turnering pågår",
  Avsluttet: "Avsluttet",
};

const INITIAL_DATOER = 3;
const DATOER_PER_KLIKK = 3;

function parseLocalDate(date: string) {
  return new Date(`${date.slice(0, 10)}T00:00:00`);
}

function todayIso() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDate(date: string, includeYear = false) {
  return parseLocalDate(date).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  });
}

function formatDateRange(arrangement: ArrangementRespons) {
  const startYear = parseLocalDate(arrangement.startDato).getFullYear();
  const endYear = parseLocalDate(arrangement.sluttDato).getFullYear();
  const currentYear = new Date().getFullYear();
  const includeStartYear = startYear !== currentYear || startYear !== endYear;
  const includeEndYear = endYear !== currentYear;

  if (arrangement.startDato === arrangement.sluttDato) {
    return { start: formatShortDate(arrangement.startDato, includeStartYear), end: null };
  }

  return {
    start: formatShortDate(arrangement.startDato, includeStartYear),
    end: formatShortDate(arrangement.sluttDato, includeEndYear),
  };
}

function formatProgramDate(date: string) {
  const formatted = parseLocalDate(date).toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return formatted.charAt(0).toLocaleUpperCase("nb-NO") + formatted.slice(1);
}

function getUpcomingDays(days: DagMedSlotsRespons[]) {
  const today = todayIso();
  return days.filter((day) => day.dato >= today && day.slots.length > 0);
}

function createProgramSummary(days: DagMedSlotsRespons[]) {
  const upcomingDays = getUpcomingDays(days);
  const slots = upcomingDays.flatMap((day) => day.slots);

  if (slots.length === 0) return null;

  const start = slots.map((slot) => slot.startTid.slice(0, 5)).sort()[0];
  const end = slots
    .map((slot) => slot.sluttTid.slice(0, 5))
    .sort()
    .at(-1);

  return {
    count: slots.length,
    dayCount: upcomingDays.length,
    timeRange: `${start}–${end}`,
  };
}

function formatCourts(courts: string[]) {
  const sorted = [...courts].sort();
  if (sorted.length <= 2) return sorted.join(" og ");
  return `${sorted.slice(0, -1).join(", ")} og ${sorted.at(-1)}`;
}

export default function ArrangementRow({ arrangement, onAvlys }: Props) {
  const navigate = useNavigate();
  const programId = useId();
  const [showProgram, setShowProgram] = useState(false);
  const [visibleDayCount, setVisibleDayCount] = useState(INITIAL_DATOER);

  const description = arrangement.beskrivelse?.trim() ?? "";
  const upcomingDays = getUpcomingDays(arrangement.slotsPrDag ?? []);
  const programSummary = createProgramSummary(arrangement.slotsPrDag ?? []);
  const nextDate = upcomingDays[0]?.dato ?? null;
  const visibleDays = upcomingDays.slice(0, visibleDayCount);
  const hasMoreDays = upcomingDays.length > visibleDayCount;
  const dates = formatDateRange(arrangement);
  const categoryDiffersFromTitle =
    arrangement.kategori.toLocaleLowerCase("nb-NO") !==
    arrangement.tittel.trim().toLocaleLowerCase("nb-NO");
  const metadata = [arrangement.grenNavn, categoryDiffersFromTitle ? arrangement.kategori : null]
    .filter(Boolean)
    .join(" · ");

  const canManageTournament =
    !!arrangement.turneringId &&
    harHandling(arrangement.kapabiliteter, Kapabiliteter.arrangement.administrerTurnering);
  const canViewTournament =
    !!arrangement.turneringId &&
    harHandling(arrangement.kapabiliteter, Kapabiliteter.arrangement.seTurnering);
  const canCancel =
    !arrangement.erPassert &&
    harHandling(arrangement.kapabiliteter, Kapabiliteter.arrangement.avlys);
  const hasActions = canManageTournament || canViewTournament || canCancel;
  const hasDetails =
    !!description ||
    !!programSummary ||
    !!arrangement.turneringStatus ||
    hasActions ||
    (!arrangement.erPassert && !programSummary);

  const summary = (
    <div className="record-card__summary arrangement-card__summary">
      <span className="arrangement-card__date">
        <RecordAccent className="arrangement-card__date-start">{dates.start}</RecordAccent>
        {dates.end ? <small>– {dates.end}</small> : null}
      </span>

      <span className="arrangement-card__identity">
        <strong>{arrangement.tittel}</strong>
        <small>{metadata}</small>
      </span>

      <RecordStatus tone={arrangement.erPassert ? "past" : "event"}>
        {arrangement.erPassert ? "Gjennomført" : nextDate ? dagerIgjenTekst(nextDate) : "Kommende"}
      </RecordStatus>
    </div>
  );

  if (!hasDetails) {
    return (
      <div
        className="record-card record-card-row arrangement-card"
        data-past={arrangement.erPassert}
      >
        <div className="record-card__static arrangement-card__static">{summary}</div>
      </div>
    );
  }

  return (
    <AccordionItem
      value={arrangement.id}
      className="record-card record-card-row arrangement-card"
      data-past={arrangement.erPassert}
    >
      <AccordionTrigger className="record-card__trigger arrangement-card__trigger hover:no-underline">
        {summary}
      </AccordionTrigger>

      <AccordionContent className="record-card__details arrangement-card__details">
        <div className="arrangement-card__detail-content">
          {description ? <p className="arrangement-card__description">{description}</p> : null}

          {arrangement.turneringStatus ? (
            <dl className="arrangement-card__facts">
              <div>
                <dt>Turnering</dt>
                <dd>
                  {TURNERING_STATUS_TEKST[arrangement.turneringStatus] ??
                    arrangement.turneringStatus}
                </dd>
              </div>
            </dl>
          ) : null}

          {programSummary ? (
            <section className="arrangement-program" aria-label="Program">
              <div className="arrangement-program__header">
                <span>
                  <strong>Program</strong>
                  <small>
                    {programSummary.count} {programSummary.count === 1 ? "tid" : "tider"} ·{" "}
                    {programSummary.dayCount} {programSummary.dayCount === 1 ? "dag" : "dager"} ·{" "}
                    {programSummary.timeRange}
                  </small>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-expanded={showProgram}
                  aria-controls={programId}
                  onClick={() => setShowProgram((visible) => !visible)}
                >
                  {showProgram ? "Skjul program" : "Vis program"}
                </Button>
              </div>

              {showProgram ? (
                <div id={programId} className="arrangement-program__days">
                  {visibleDays.map(({ dato, slots }) => (
                    <section key={dato} className="arrangement-program__day">
                      <h4>
                        <time dateTime={dato}>{formatProgramDate(dato)}</time>
                      </h4>
                      <div className="arrangement-program__slots">
                        {slots.map((slot) => (
                          <div
                            key={`${dato}-${slot.startTid}-${slot.sluttTid}-${slot.baneNavn.join("-")}`}
                            className="arrangement-program__slot"
                          >
                            <time>
                              {slot.startTid.slice(0, 5)}–{slot.sluttTid.slice(0, 5)}
                            </time>
                            <span>{formatCourts(slot.baneNavn)}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}

                  {hasMoreDays ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="arrangement-program__more"
                      onClick={() => setVisibleDayCount((count) => count + DATOER_PER_KLIKK)}
                    >
                      Vis flere datoer
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : !arrangement.erPassert ? (
            <p className="arrangement-card__no-program">Ingen kommende tider i programmet.</p>
          ) : null}

          {hasActions ? (
            <div className="record-card__actions arrangement-card__actions">
              {canManageTournament ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`../turnering/${arrangement.turneringId}`)}
                >
                  Administrer turnering
                </Button>
              ) : canViewTournament ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`../turnering/${arrangement.turneringId}`)}
                >
                  Se turnering
                </Button>
              ) : null}

              {canCancel ? (
                <SlettArrangementDialog
                  tittel={arrangement.tittel}
                  harTurnering={arrangement.turneringId !== null}
                  onSlett={() => onAvlys(arrangement).then(() => undefined)}
                  trigger={
                    <Button type="button" variant="destructive" size="sm">
                      Avlys
                    </Button>
                  }
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
