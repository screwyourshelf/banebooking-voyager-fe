import { cn } from "@/lib/utils";

type Props = {
  ariaLabel: string;
  rows?: number;
  layout?: "time" | "date";
  className?: string;
};

export default function RecordCollectionSkeleton({
  ariaLabel,
  rows = 3,
  layout = "time",
  className,
}: Props) {
  return (
    <div
      className={cn("record-list record-collection-skeleton", className)}
      data-layout={layout}
      role="status"
      aria-label={ariaLabel}
    >
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="record-card record-collection-skeleton__row">
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
