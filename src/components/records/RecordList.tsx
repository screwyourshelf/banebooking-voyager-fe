import type { ReactNode } from "react";
import { Accordion } from "@/components/ui/accordion";

type ListProps = {
  children: ReactNode;
  loading?: boolean;
  ariaLabel?: string;
  role?: "list" | "status";
};

type AccordionListProps = {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  loading?: boolean;
  ariaLabel?: string;
};

export function RecordList({ children, loading = false, ariaLabel, role }: ListProps) {
  return (
    <div
      className="record-list"
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      role={role}
    >
      {children}
    </div>
  );
}

export function RecordAccordionList({
  children,
  value,
  defaultValue,
  onValueChange,
  loading = false,
  ariaLabel,
}: AccordionListProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="record-list"
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
    >
      {children}
    </Accordion>
  );
}
