import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type TimeRangeProps = {
  start: string;
  end: string;
  accessory?: ReactNode;
};

type SummaryCopyProps = {
  title: ReactNode;
  description?: ReactNode;
};

export function RecordLeadingValue({ children }: Props) {
  return <strong className="record-card__leading-value">{children}</strong>;
}

export function RecordEyebrow({ children }: Props) {
  return <span className="record-card__eyebrow">{children}</span>;
}

export function RecordTimeRange({ start, end, accessory }: TimeRangeProps) {
  return (
    <span className="record-card__time">
      <span className="record-card__time-range">
        <RecordLeadingValue>{start}</RecordLeadingValue>
        <span>–{end}</span>
      </span>
      {accessory}
    </span>
  );
}

export function RecordSummaryCopy({ title, description }: SummaryCopyProps) {
  return (
    <span className="record-card__copy">
      <span className="record-card__title">{title}</span>
      {description ? <span className="record-card__description">{description}</span> : null}
    </span>
  );
}
