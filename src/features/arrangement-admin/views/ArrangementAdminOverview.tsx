import { useMemo, useState } from "react";
import { CalendarCog, CalendarX2 } from "lucide-react";
import { Collection, Dialog } from "@/components";

import { ActionFeedback, type ActionFeedbackMessage } from "@/components/feedback";
import { RecordCollectionSkeleton, RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import type { ArrangementRespons } from "@/types";
import {
  formaterArrangementMetadata,
  getArrangementLifecycleStatus,
} from "@/utils/arrangementPresentation";
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

export default function ArrangementAdminOverview({ createOpen, onCreateOpenChange }: Props) {
  const [showPast, setShowPast] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creationFeedback, setCreationFeedback] = useState<ActionFeedbackMessage | null>(null);
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
      {creationFeedback ? <ActionFeedback {...creationFeedback} /> : null}

      <Collection
        icon={<CalendarCog aria-hidden="true" />}
        title={`${visibleArrangements.length} arrangement${
          visibleArrangements.length === 1 ? "" : "er"
        }`}
        scope={showPast ? "Alle" : "Nå og fremover"}
        toggle={{
          title: "Vis tidligere",
          checked: showPast,
          onCheckedChange: setShowPast,
          disabled: isLoadingOverview,
        }}
        filter={
          grener.length > 1
            ? {
                label: "Filtrer på gren",
                groups: [
                  {
                    label: "Gren",
                    options: grener.map((gren) => ({ value: gren.slug, label: gren.navn })),
                    selectedValues: selectedBranches,
                    onToggle: (value) =>
                      setSelectedBranches((current) =>
                        current.includes(value)
                          ? current.filter((branch) => branch !== value)
                          : [...current, value]
                      ),
                  },
                ],
                onReset: () => setSelectedBranches([]),
                disabled: isLoadingOverview,
              }
            : undefined
        }
      >
        {isLoadingOverview ? (
          <RecordCollectionSkeleton ariaLabel="Laster arrangementer" rows={4} />
        ) : arrangementerFeil ? (
          <RecordListState
            icon={<CalendarX2 aria-hidden="true" />}
            title="Kunne ikke laste arrangementene"
            description={arrangementerFeil.message}
            tone="danger"
            role="alert"
            action={
              <Button type="button" variant="outline" onClick={() => void refetchArrangementer()}>
                Prøv igjen
              </Button>
            }
          />
        ) : visibleArrangements.length === 0 ? (
          <RecordListState
            icon={<CalendarX2 aria-hidden="true" />}
            title={showPast ? "Ingen arrangementer ennå" : "Ingen aktive arrangementer"}
            description={
              showPast
                ? "Opprett et arrangement for å legge til tider."
                : "Vis tidligere eller opprett et nytt arrangement."
            }
          />
        ) : (
          <Collection.List>
            {visibleArrangements.map((arrangement) => {
              const status = getArrangementLifecycleStatus(arrangement);
              const metadata = formaterArrangementMetadata(arrangement);

              return (
                <Collection.Row
                  key={arrangement.id}
                  title={arrangement.tittel}
                  description={formatDateRange(arrangement)}
                  meta={metadata}
                  status={status}
                  muted={arrangement.erPassert}
                  ariaLabel={`Rediger ${arrangement.tittel}, ${formatDateRange(arrangement)}`}
                  interaction={{ type: "open", onOpen: () => setSelectedId(arrangement.id) }}
                />
              );
            })}
          </Collection.List>
        )}
      </Collection>

      <Dialog.Editor
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        backLabel="Alle arrangementer"
        eyebrow="Nytt arrangement"
        title="Opprett arrangement"
        description="Legg inn informasjon og bygg listen over banetider."
      >
        <OpprettArrangementView
          onCreated={(feedback) => {
            setCreationFeedback(feedback);
            onCreateOpenChange(false);
          }}
        />
      </Dialog.Editor>

      <Dialog.Editor
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
      >
        {selectedId ? (
          <RedigerArrangementView
            arrangementId={selectedId}
            onDeleted={() => setSelectedId(null)}
          />
        ) : null}
      </Dialog.Editor>
    </>
  );
}
