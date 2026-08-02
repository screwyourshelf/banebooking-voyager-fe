import { LoaderCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

import Page from "@/components/Page";
import {
  RecordCollection,
  RecordCollectionBody,
  RecordCollectionHeader,
  RecordCollectionSkeleton,
} from "@/components/records";

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

      <RecordCollection ariaLabel={label} busy>
        <RecordCollectionHeader
          icon={<LoaderCircle className="page-content-skeleton__spinner" />}
          title="Laster innhold"
          description="Gjør siden klar"
        />
        {controls ? (
          <div className="page-content-skeleton__controls" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        <RecordCollectionBody>
          <RecordCollectionSkeleton ariaLabel={label} rows={rows} layout={layout} />
        </RecordCollectionBody>
      </RecordCollection>
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
