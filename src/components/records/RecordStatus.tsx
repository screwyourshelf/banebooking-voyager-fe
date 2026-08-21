import type { ReactNode } from "react";

export type RecordStatusTone =
  | "available"
  | "own"
  | "event"
  | "busy"
  | "past"
  | "warning"
  | "danger";

export type RecordStatusAppearance = "badge" | "plain";

type Props = {
  tone: RecordStatusTone;
  children: ReactNode;
  align?: "default" | "text-start";
  appearance?: RecordStatusAppearance;
};

export default function RecordStatus({
  tone,
  children,
  align = "default",
  appearance = "badge",
}: Props) {
  return (
    <span
      className="record-status"
      data-tone={tone}
      data-align={align}
      data-appearance={appearance}
    >
      {children}
    </span>
  );
}
