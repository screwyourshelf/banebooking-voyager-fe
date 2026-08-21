import { useFeed } from "@/hooks/useFeed";

import NyheterContent from "./NyheterContent";

export default function NyheterView() {
  const { feed, isLoading, isFetching, error, refetch } = useFeed();

  return (
    <NyheterContent
      feed={feed}
      isLoading={isLoading}
      queryError={error?.message ?? null}
      isFetching={isFetching}
      onRetry={() => void refetch()}
    />
  );
}
