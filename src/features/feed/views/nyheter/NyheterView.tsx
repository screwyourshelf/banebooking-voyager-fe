import { RecordCollectionPage } from "@/components/records";
import { useFeed } from "@/hooks/useFeed";

import NyheterContent from "./NyheterContent";

export default function NyheterView() {
  const { feed, isLoading, isFetching, error, refetch } = useFeed();

  return (
    <RecordCollectionPage eyebrow="Klubben" title="Nyheter" description="Siste nytt fra klubben.">
      <NyheterContent
        feed={feed}
        isLoading={isLoading}
        queryError={error?.message ?? null}
        isFetching={isFetching}
        onRetry={() => void refetch()}
      />
    </RecordCollectionPage>
  );
}
