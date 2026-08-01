import { useMemo, useState } from "react";
import { CalendarDays, CalendarX, RefreshCw } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import FilterSwitch from "@/components/controls/FilterSwitch";
import { Inline } from "@/components/layout";
import {
  RecordChoiceFilter,
  RecordCollectionSkeleton,
  RecordCollectionToolbar,
  RecordListState,
} from "@/components/records";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { ArrangementRespons } from "@/types";

import ArrangementRow from "./ArrangementRow";

type Props = {
  visHistoriske: boolean;
  onToggleVisHistoriske: (value: boolean) => void;
  arrangementer: ArrangementRespons[];
  isLoading: boolean;
  queryError: string | null;
  isFetching: boolean;
  onRetry: () => void;
  onAvlys: (arrangement: ArrangementRespons) => Promise<unknown>;
  defaultArrangementId?: string;
};

export default function ArrangementerContent({
  visHistoriske,
  onToggleVisHistoriske,
  arrangementer,
  isLoading,
  queryError,
  isFetching,
  onRetry,
  onAvlys,
  defaultArrangementId,
}: Props) {
  const [openId, setOpenId] = useState(defaultArrangementId ?? "");
  const [grenFilter, setGrenFilter] = useState<string[]>([]);

  const grener = useMemo(
    () => [...new Set(arrangementer.map((arrangement) => arrangement.grenNavn))].sort(),
    [arrangementer]
  );

  const filteredArrangements = useMemo(() => {
    if (grenFilter.length === 0) return arrangementer;
    return arrangementer.filter((arrangement) => grenFilter.includes(arrangement.grenNavn));
  }, [arrangementer, grenFilter]);

  function toggleGren(gren: string) {
    setGrenFilter((current) =>
      current.includes(gren) ? current.filter((item) => item !== gren) : [...current, gren]
    );
  }

  const {
    synlige: visibleArrangements,
    harFlere,
    gjenstaar,
    visFlere,
  } = usePagination(filteredArrangements, 10, `${String(visHistoriske)}|${grenFilter.join(",")}`);

  const countLabel = isLoading
    ? "Henter arrangementer…"
    : `${filteredArrangements.length} ${filteredArrangements.length === 1 ? "arrangement" : "arrangementer"}`;
  const hasFilteredEmptyState = arrangementer.length > 0 && filteredArrangements.length === 0;

  return (
    <section
      className="record-collection arrangements"
      aria-label="Arrangementsoversikt"
      aria-busy={isLoading}
    >
      <RecordCollectionToolbar
        icon={<CalendarDays />}
        title={countLabel}
        description={visHistoriske ? "Kommende og gjennomførte" : "Kommende arrangementer"}
        actions={
          <FilterSwitch
            title="Vis tidligere"
            checked={visHistoriske}
            onCheckedChange={onToggleVisHistoriske}
            disabled={isFetching}
          />
        }
      />

      {grener.length > 1 ? (
        <RecordChoiceFilter
          label="Gren"
          options={grener.map((gren) => ({ value: gren, label: gren }))}
          selectedValues={grenFilter}
          onToggle={toggleGren}
          onReset={() => setGrenFilter([])}
          disabled={isFetching}
        />
      ) : null}

      <div className="record-collection__body">
        {isLoading ? (
          <RecordCollectionSkeleton ariaLabel="Laster arrangementer" layout="date" />
        ) : queryError ? (
          <RecordListState
            icon={<RefreshCw aria-hidden="true" />}
            title="Kunne ikke hente arrangementene"
            description={queryError}
            tone="danger"
            role="alert"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={isFetching}
              >
                {isFetching ? "Prøver igjen…" : "Prøv igjen"}
              </Button>
            }
          />
        ) : filteredArrangements.length === 0 ? (
          <RecordListState
            icon={<CalendarX aria-hidden="true" />}
            title={
              hasFilteredEmptyState
                ? "Ingen arrangementer for valgt gren"
                : visHistoriske
                  ? "Ingen arrangementer ennå"
                  : "Ingen kommende arrangementer"
            }
            description={
              hasFilteredEmptyState
                ? "Velg en annen gren eller nullstill filteret."
                : visHistoriske
                  ? "Når klubben oppretter arrangementer, finner du både kommende og gjennomførte her."
                  : "Nye arrangementer dukker opp her når de blir publisert av klubben."
            }
            action={
              hasFilteredEmptyState ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setGrenFilter([])}>
                  Nullstill filter
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <Accordion
              type="single"
              collapsible
              className="record-list arrangements__list"
              value={openId}
              onValueChange={setOpenId}
              data-loading={isFetching}
            >
              {visibleArrangements.map((arrangement) => (
                <ArrangementRow key={arrangement.id} arrangement={arrangement} onAvlys={onAvlys} />
              ))}
            </Accordion>

            {harFlere ? (
              <Inline justify="center" className="record-collection__pagination">
                <Button type="button" variant="outline" size="sm" onClick={visFlere}>
                  Vis flere ({gjenstaar} gjenstår)
                </Button>
              </Inline>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
