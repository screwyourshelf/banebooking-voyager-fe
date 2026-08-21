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
  return (
    <strong data-ui="record-leading-value" data-part="leading-value">
      {children}
    </strong>
  );
}

export function RecordTimeRange({ start, end, accessory }: TimeRangeProps) {
  return (
    <span data-ui="record-time" data-part="time">
      <span data-part="time-range">
        <RecordLeadingValue>{start}</RecordLeadingValue>
        <span data-part="end-time">–{end}</span>
      </span>
      {accessory}
    </span>
  );
}
