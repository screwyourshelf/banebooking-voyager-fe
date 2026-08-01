import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

export function RecordAccent({ children, className }: Props) {
  return <strong className={cn("record-card__accent", className)}>{children}</strong>;
}

export function RecordEyebrow({ children, className }: Props) {
  return <span className={cn("record-card__eyebrow", className)}>{children}</span>;
}
