import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";

import ArrangementerContent from "./ArrangementerContent";
import { useArrangementer } from "./useArrangementer";
import { useAvlysArrangement } from "./useAvlysArrangement";

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
  const defaultArrangementId = searchParams.get("arrangement") ?? undefined;

  return (
    <div className="record-collection-page">
      <PageHeader
        eyebrow="Klubben"
        title="Arrangementer"
        description="Se hva som skjer i klubben, og åpne programmet for tider og baner."
        className="record-collection-page__heading"
      />

      <ArrangementerContent
        visHistoriske={visHistoriske}
        onToggleVisHistoriske={setVisHistoriske}
        arrangementer={arrangementer}
        isLoading={isLoading}
        queryError={error?.message ?? null}
        isFetching={isFetching}
        onRetry={() => void refetch()}
        onAvlys={onAvlys}
        defaultArrangementId={defaultArrangementId}
      />
    </div>
  );
}
