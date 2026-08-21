import { Newspaper, RefreshCw } from "lucide-react";

import {
  RecordCollectionPagination,
  RecordCollectionSkeleton,
  RecordListState,
} from "@/components/records";
import { Collection } from "@/components";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/usePagination";
import type { FeedItemRespons } from "@/types";

import NyhetRow from "./NyhetRow";

type Props = {
  feed: FeedItemRespons[];
  isLoading: boolean;
  queryError: string | null;
  isFetching: boolean;
  onRetry: () => void;
};

export default function NyheterContent({
  feed,
  isLoading,
  queryError,
  isFetching,
  onRetry,
}: Props) {
  const { synlige, harFlere, gjenstaar, visFlere } = usePagination(feed, 10, feed.length);
  const countLabel = isLoading
    ? "Laster nyheter…"
    : `${feed.length} ${feed.length === 1 ? "nyhet" : "nyheter"}`;

  return (
    <Collection icon={<Newspaper />} title={countLabel} busy={isLoading}>
      {isLoading ? (
        <RecordCollectionSkeleton ariaLabel="Laster nyheter" rows={4} />
      ) : queryError ? (
        <RecordListState
          icon={<RefreshCw aria-hidden="true" />}
          title="Kunne ikke laste nyhetene"
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
      ) : feed.length === 0 ? (
        <RecordListState
          icon={<Newspaper aria-hidden="true" />}
          title="Ingen nyheter akkurat nå"
          description="Når klubben publiserer noe, vises det her."
        />
      ) : (
        <>
          <Collection.List loading={isFetching} ariaLabel="Nyheter">
            {synlige.map((item) => (
              <NyhetRow
                key={`${item.lenke || item.tittel}-${item.publisertDato ?? "uten-dato"}`}
                item={item}
              />
            ))}
          </Collection.List>

          {harFlere ? (
            <RecordCollectionPagination>
              <Button type="button" variant="outline" size="sm" onClick={visFlere}>
                Vis flere ({gjenstaar} gjenstår)
              </Button>
            </RecordCollectionPagination>
          ) : null}
        </>
      )}
    </Collection>
  );
}
