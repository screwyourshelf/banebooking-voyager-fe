import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  RecordAccordionCard,
  RecordCard,
  RecordCardActions,
  RecordCardDetails,
  RecordCardStatic,
  RecordCardSummary,
  RecordCardTrigger,
  RecordDateRange,
  RecordDetailsLayout,
  RecordEmptyNote,
  RecordFacts,
  RecordIdentity,
  RecordProgram,
  RecordProgramDay,
  RecordProgramDays,
  RecordProgramHeader,
  RecordProgramMore,
  RecordProgramSlot,
  RecordStatus,
} from "@/components/records";
import { SlettArrangementDialog } from "@/features/arrangement-admin/components";
import type { ArrangementRespons, DagMedSlotsRespons } from "@/types";
import { dagerIgjenTekst } from "@/utils/datoUtils";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { formaterArrangementKategori } from "@/utils/arrangementPresentation";

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
  const categoryLabel = formaterArrangementKategori(arrangement.kategori);
  const categoryDiffersFromTitle =
    categoryLabel.toLocaleLowerCase("nb-NO") !==
    arrangement.tittel.trim().toLocaleLowerCase("nb-NO");
  const metadata = [arrangement.grenNavn, categoryDiffersFromTitle ? categoryLabel : null]
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
    !!arrangement.booketAv ||
    !!programSummary ||
    !!arrangement.turneringStatus ||
    hasActions ||
    (!arrangement.erPassert && !programSummary);

  const summary = (
    <RecordCardSummary layout="date">
      <RecordDateRange start={dates.start} end={dates.end} />
      <RecordIdentity title={arrangement.tittel} description={metadata} />

      <RecordStatus tone={arrangement.erPassert ? "past" : "event"}>
        {arrangement.erPassert ? "Gjennomført" : nextDate ? dagerIgjenTekst(nextDate) : "Kommende"}
      </RecordStatus>
    </RecordCardSummary>
  );

  if (!hasDetails) {
    return (
      <RecordCard>
        <RecordCardStatic>{summary}</RecordCardStatic>
      </RecordCard>
    );
  }

  return (
    <RecordAccordionCard value={arrangement.id}>
      <RecordCardTrigger>{summary}</RecordCardTrigger>

      <RecordCardDetails>
        <RecordDetailsLayout>
          {description ? <p>{description}</p> : null}

          <RecordFacts
            items={[
              ...(arrangement.booketAv
                ? [{ label: "Booket av", value: arrangement.booketAv }]
                : []),
              ...(arrangement.turneringStatus
                ? [
                    {
                      label: "Turnering",
                      value:
                        TURNERING_STATUS_TEKST[arrangement.turneringStatus] ??
                        arrangement.turneringStatus,
                    },
                  ]
                : []),
            ]}
          />

          {programSummary ? (
            <RecordProgram>
              <RecordProgramHeader
                title="Program"
                summary={
                  <>
                    {programSummary.count} {programSummary.count === 1 ? "tid" : "tider"} ·{" "}
                    {programSummary.dayCount} {programSummary.dayCount === 1 ? "dag" : "dager"} ·{" "}
                    {programSummary.timeRange}
                  </>
                }
                expanded={showProgram}
                controls={programId}
                onToggle={() => setShowProgram((visible) => !visible)}
              />

              {showProgram ? (
                <RecordProgramDays id={programId}>
                  {visibleDays.map(({ dato, slots }) => (
                    <RecordProgramDay
                      key={dato}
                      title={<time dateTime={dato}>{formatProgramDate(dato)}</time>}
                    >
                      {slots.map((slot) => (
                        <RecordProgramSlot
                          key={`${dato}-${slot.startTid}-${slot.sluttTid}-${slot.baneNavn.join("-")}`}
                          time={`${slot.startTid.slice(0, 5)}–${slot.sluttTid.slice(0, 5)}`}
                        >
                          {formatCourts(slot.baneNavn)}
                        </RecordProgramSlot>
                      ))}
                    </RecordProgramDay>
                  ))}

                  {hasMoreDays ? (
                    <RecordProgramMore
                      onClick={() => setVisibleDayCount((count) => count + DATOER_PER_KLIKK)}
                    >
                      Vis flere datoer
                    </RecordProgramMore>
                  ) : null}
                </RecordProgramDays>
              ) : null}
            </RecordProgram>
          ) : !arrangement.erPassert ? (
            <RecordEmptyNote>Ingen kommende tider i programmet.</RecordEmptyNote>
          ) : null}

          {hasActions ? (
            <RecordCardActions>
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
            </RecordCardActions>
          ) : null}
        </RecordDetailsLayout>
      </RecordCardDetails>
    </RecordAccordionCard>
  );
}
