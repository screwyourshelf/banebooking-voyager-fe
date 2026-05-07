import { useState } from "react";
import { ListSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import { useSearchParams } from "react-router-dom";
import { useArrangementer } from "./useArrangementer";
import { useAvlysArrangement } from "./useAvlysArrangement";

import ArrangementerContent from "./ArrangementerContent";

export default function ArrangementerView() {
  const [searchParams] = useSearchParams();
  const [visHistoriske, setVisHistoriske] = useState(false);

  const {
    data: arrangementer = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useArrangementer(visHistoriske);
  const { onAvlys } = useAvlysArrangement();

  if (isLoading) return <ListSkeleton />;

  const defaultArrangementId = searchParams.get("arrangement") ?? undefined;

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      <ArrangementerContent
        visHistoriske={visHistoriske}
        onToggleVisHistoriske={setVisHistoriske}
        arrangementer={arrangementer}
        onAvlys={onAvlys}
        defaultArrangementId={defaultArrangementId}
        serverFeil={null}
      />
    </QueryFeil>
  );
}
