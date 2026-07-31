import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type RecordStatusTone =
  | "available"
  | "own"
  | "event"
  | "busy"
  | "past"
  | "warning"
  | "danger";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone: RecordStatusTone;
};

export default function RecordStatus({ tone, className, children, ...props }: Props) {
  return (
    <span className={cn("record-status", className)} data-tone={tone} {...props}>
      {children}
    </span>
  );
}
