import { RecordCard } from "./RecordCard";
import { RecordList } from "./RecordList";

type Props = {
  ariaLabel: string;
  rows?: number;
  layout?: "time" | "date";
};

export default function RecordCollectionSkeleton({ ariaLabel, rows = 3, layout = "time" }: Props) {
  return (
    <div
      className="record-collection-skeleton"
      data-layout={layout}
      role="status"
      aria-label={ariaLabel}
    >
      <RecordList>
        {Array.from({ length: rows }, (_, index) => (
          <RecordCard key={index}>
            <div className="record-collection-skeleton__row" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </RecordCard>
        ))}
      </RecordList>
    </div>
  );
}
