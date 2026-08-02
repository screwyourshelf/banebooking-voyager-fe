import { useMemo, useState } from "react";
import { CalendarDays, CalendarX, RefreshCw } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import {
  RecordAccordionList,
  RecordCollection,
  RecordCollectionBody,
  RecordCollectionHeader,
  RecordCollectionPagination,
  RecordCollectionSkeleton,
  RecordListState,
} from "@/components/records";
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
    ? "Laster arrangementer…"
    : `${filteredArrangements.length} ${filteredArrangements.length === 1 ? "arrangement" : "arrangementer"}`;
  const hasFilteredEmptyState = arrangementer.length > 0 && filteredArrangements.length === 0;

  return (
    <RecordCollection ariaLabel="Arrangementsoversikt" busy={isLoading}>
      <RecordCollectionHeader
        icon={<CalendarDays />}
        title={countLabel}
        description={visHistoriske ? "Kommende og tidligere" : "Kommende"}
        toggle={{
          title: "Vis tidligere",
          checked: visHistoriske,
          onCheckedChange: onToggleVisHistoriske,
          disabled: isFetching,
        }}
        filter={
          grener.length > 1
            ? {
                label: "Filtrer på gren",
                groups: [
                  {
                    label: "Gren",
                    options: grener.map((gren) => ({ value: gren, label: gren })),
                    selectedValues: grenFilter,
                    onToggle: toggleGren,
                  },
                ],
                onReset: () => setGrenFilter([]),
                disabled: isFetching,
              }
            : undefined
        }
      />

      <RecordCollectionBody>
        {isLoading ? (
          <RecordCollectionSkeleton ariaLabel="Laster arrangementer" layout="date" />
        ) : queryError ? (
          <RecordListState
            icon={<RefreshCw aria-hidden="true" />}
            title="Kunne ikke laste arrangementene"
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
                  ? "Når klubben publiserer noe, vises kommende og tidligere arrangementer her."
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
            <RecordAccordionList
              value={openId}
              onValueChange={setOpenId}
              loading={isFetching}
              ariaLabel="Arrangementer"
            >
              {visibleArrangements.map((arrangement) => (
                <ArrangementRow key={arrangement.id} arrangement={arrangement} onAvlys={onAvlys} />
              ))}
            </RecordAccordionList>

            {harFlere ? (
              <RecordCollectionPagination>
                <Button type="button" variant="outline" size="sm" onClick={visFlere}>
                  Vis flere ({gjenstaar} gjenstår)
                </Button>
              </RecordCollectionPagination>
            ) : null}
          </>
        )}
      </RecordCollectionBody>
    </RecordCollection>
  );
}
