import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type TimeRangeProps = {
  start: string;
  end: string;
  accessory?: ReactNode;
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
