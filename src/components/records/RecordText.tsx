import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function RecordLeadingValue({ children }: Props) {
  return <strong className="record-card__leading-value">{children}</strong>;
}

export function RecordEyebrow({ children }: Props) {
  return <span className="record-card__eyebrow">{children}</span>;
}
