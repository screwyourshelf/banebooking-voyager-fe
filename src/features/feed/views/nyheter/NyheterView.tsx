import { PageHeader } from "@/components/layout";
import { useFeed } from "@/hooks/useFeed";

import NyheterContent from "./NyheterContent";

export default function NyheterView() {
  const { feed, isLoading, isFetching, error, refetch } = useFeed();

  return (
    <div className="record-collection-page">
      <PageHeader
        eyebrow="Klubben"
        title="Nyheter"
        description="Siste nytt fra klubben."
        className="record-collection-page__heading"
      />

      <NyheterContent
        feed={feed}
        isLoading={isLoading}
        queryError={error?.message ?? null}
        isFetching={isFetching}
        onRetry={() => void refetch()}
      />
    </div>
  );
}
