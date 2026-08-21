import { Skeleton } from "@/components/ui/skeleton";

export default function ListSkeleton() {
  return (
    <div data-ui="list-skeleton">
      {/* Seksjon-header */}
      <div data-part="header">
        <Skeleton data-part="eyebrow" />
        <Skeleton data-part="title" />
      </div>

      {/* Accordion-lignende rader */}
      <div data-part="list">
        {[...Array(4)].map((_, i) => (
          <div key={i} data-part="row">
            <Skeleton data-part="icon" />
            <div data-part="content">
              <Skeleton data-part="row-title" />
              <Skeleton data-part="description" />
            </div>
            <Skeleton data-part="status" />
          </div>
        ))}
      </div>
    </div>
  );
}
