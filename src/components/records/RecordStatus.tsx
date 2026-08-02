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
  align?: "default" | "text-start";
};

export default function RecordStatus({ tone, children, align = "default" }: Props) {
  return (
    <span className="record-status" data-tone={tone} data-align={align}>
      {children}
    </span>
  );
}
