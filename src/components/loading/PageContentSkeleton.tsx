import { useLocation } from "react-router-dom";

import Page from "@/components/Page";
import RecordCollectionLoading from "@/components/records/RecordCollectionLoading";

type PageContentSkeletonProps = {
  label?: string;
  rows?: number;
  layout?: "time" | "date";
  controls?: boolean;
};

export function PageContentSkeleton({
  label = "Laster siden",
  rows = 5,
  layout = "time",
  controls = false,
}: PageContentSkeletonProps) {
  return (
    <div className="page-content-skeleton">
      <div className="page-content-skeleton__heading" aria-hidden="true">
        <span className="page-content-skeleton__eyebrow" />
        <span className="page-content-skeleton__title" />
        <span className="page-content-skeleton__description" />
      </div>

      <RecordCollectionLoading label={label} rows={rows} layout={layout} controls={controls} />
    </div>
  );
}

export function RouteContentSkeleton(props: PageContentSkeletonProps) {
  const { pathname } = useLocation();
  const isContentFirstRoute =
    /\/(?:bookinger|arrangementer|nyheter|minside|login|vilkaar|sperret|kunngjøring|bekreft-medlemskap)$/.test(
      pathname
    ) || pathname.includes("/turnering/");

  return (
    <Page width="xl">
      <PageContentSkeleton controls={!isContentFirstRoute} {...props} />
    </Page>
  );
}
