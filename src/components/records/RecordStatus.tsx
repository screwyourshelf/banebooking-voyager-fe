import type { ReactNode } from "react";

export type RecordStatusTone =
  | "available"
  | "own"
  | "event"
  | "busy"
  | "past"
  | "warning"
  | "danger";

type Props = {
  tone: RecordStatusTone;
  children: ReactNode;
};

export default function RecordStatus({ tone, children }: Props) {
  return (
    <span className="record-status" data-tone={tone}>
      {children}
    </span>
  );
}
