import { useMemo, useState } from "react";
import { CalendarCog, CalendarX2 } from "lucide-react";
import {
  AdminEditorDialog,
  AdminEntityCollection,
  AdminEntityList,
  AdminEntityRow,
} from "@/components/admin";
import FilterSwitch from "@/components/controls/FilterSwitch";
import {
  RecordChoiceFilter,
  RecordCollectionSkeleton,
  RecordListState,
} from "@/components/records";
import { Button } from "@/components/ui/button";
import type { ArrangementRespons } from "@/types";
import { useRedigerArrangement } from "../hooks/useRedigerArrangement";
import OpprettArrangementView from "./arrangement/OpprettArrangementView";
import RedigerArrangementView from "./rediger-arrangement/RedigerArrangementView";

type Props = {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
};

function parseLocalDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`);
}

function formatDate(value: string, includeYear = false) {
  return parseLocalDate(value).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  });
}

function formatDateRange(arrangement: ArrangementRespons) {
  const currentYear = new Date().getFullYear();
  const startYear = parseLocalDate(arrangement.startDato).getFullYear();
  const endYear = parseLocalDate(arrangement.sluttDato).getFullYear();
  const start = formatDate(
    arrangement.startDato,
    startYear !== currentYear || startYear !== endYear
  );

  if (arrangement.startDato === arrangement.sluttDato) return start;

  return `${start}–${formatDate(arrangement.sluttDato, endYear !== currentYear)}`;
}

function getStatus(arrangement: ArrangementRespons) {
  if (arrangement.erPassert) return { label: "Gjennomført", tone: "past" as const };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseLocalDate(arrangement.startDato);
  const end = parseLocalDate(arrangement.sluttDato);

  return start <= today && today <= end
    ? { label: "Pågår", tone: "event" as const }
    : { label: "Kommende", tone: "available" as const };
}

export default function ArrangementAdminOverview({ createOpen, onCreateOpenChange }: Props) {
  const [showPast, setShowPast] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    arrangementer = [],
    arrangementerFeil,
    refetchArrangementer,
    grener,
    isLoading,
    isLoadingArrangementer,
  } = useRedigerArrangement(null, "");

  const visibleArrangements = useMemo(
    () =>
      arrangementer.filter(
        (arrangement) =>
          (showPast || !arrangement.erPassert) &&
          (selectedBranches.length === 0 || selectedBranches.includes(arrangement.grenSlug))
      ),
    [arrangementer, selectedBranches, showPast]
  );
  const selectedArrangement = arrangementer.find((arrangement) => arrangement.id === selectedId);
  const isLoadingOverview = isLoading || isLoadingArrangementer;

  return (
    <>
      <AdminEntityCollection
        icon={<CalendarCog aria-hidden="true" />}
        title={`${visibleArrangements.length} arrangement${visibleArrangements.length === 1 ? "" : "er"}`}
        description={showPast ? "Aktive, kommende og gjennomførte" : "Aktive og kommende"}
        actions={
          <FilterSwitch
            title="Vis passerte"
            checked={showPast}
            onCheckedChange={setShowPast}
            disabled={isLoadingOverview}
          />
        }
        filters={
          grener.length > 1 ? (
            <RecordChoiceFilter
              label="Grener"
              options={grener.map((gren) => ({ value: gren.slug, label: gren.navn }))}
              selectedValues={selectedBranches}
              onToggle={(value) =>
                setSelectedBranches((current) =>
                  current.includes(value)
                    ? current.filter((branch) => branch !== value)
                    : [...current, value]
                )
              }
              onReset={() => setSelectedBranches([])}
              disabled={isLoadingOverview}
            />
          ) : undefined
        }
      >
        {isLoadingOverview ? (
          <RecordCollectionSkeleton ariaLabel="Laster arrangementer" rows={4} layout="date" />
        ) : arrangementerFeil ? (
          <RecordListState
            icon={<CalendarX2 aria-hidden="true" />}
            title="Kunne ikke laste arrangementene"
            description={arrangementerFeil.message}
            action={
              <Button type="button" variant="outline" onClick={() => void refetchArrangementer()}>
                Prøv igjen
              </Button>
            }
            tone="danger"
            role="alert"
          />
        ) : visibleArrangements.length === 0 ? (
          <RecordListState
            icon={<CalendarX2 aria-hidden="true" />}
            title={showPast ? "Ingen arrangementer" : "Ingen aktive arrangementer"}
            description={
              showPast
                ? "Opprett et arrangement for å legge til tider."
                : "Vis passerte eller opprett et nytt arrangement."
            }
            action={
              !showPast && arrangementer.some((arrangement) => arrangement.erPassert) ? (
                <Button type="button" variant="outline" onClick={() => setShowPast(true)}>
                  Vis passerte
                </Button>
              ) : undefined
            }
          />
        ) : (
          <AdminEntityList>
            {visibleArrangements.map((arrangement) => {
              const status = getStatus(arrangement);
              const metadata = [arrangement.grenNavn, arrangement.kategori]
                .filter(Boolean)
                .join(" · ");

              return (
                <AdminEntityRow
                  key={arrangement.id}
                  title={arrangement.tittel}
                  meta={formatDateRange(arrangement)}
                  description={metadata}
                  status={status.label}
                  statusTone={status.tone}
                  ariaLabel={`Rediger ${arrangement.tittel}, ${formatDateRange(arrangement)}`}
                  onSelect={() => setSelectedId(arrangement.id)}
                />
              );
            })}
          </AdminEntityList>
        )}
      </AdminEntityCollection>

      <AdminEditorDialog
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        backLabel="Alle arrangementer"
        eyebrow="Nytt arrangement"
        title="Opprett arrangement"
        description="Legg inn informasjon og bygg den konkrete bookinglisten før du oppretter."
        size="wide"
      >
        <OpprettArrangementView onCreated={() => onCreateOpenChange(false)} />
      </AdminEditorDialog>

      <AdminEditorDialog
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
        backLabel="Alle arrangementer"
        eyebrow="Rediger arrangement"
        title={selectedArrangement?.tittel ?? "Arrangement"}
        description={
          selectedArrangement
            ? `${formatDateRange(selectedArrangement)} · ${selectedArrangement.grenNavn}`
            : "Laster arrangementet."
        }
        size="wide"
      >
        {selectedId ? (
          <RedigerArrangementView
            arrangementId={selectedId}
            onDeleted={() => setSelectedId(null)}
          />
        ) : null}
      </AdminEditorDialog>
    </>
  );
}
