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

type DateGroupProps = {
  children: ReactNode;
};

type DateGroupHeadingProps = {
  date: string;
  label: string;
  relativeLabel?: string | null;
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

export function RecordDateGroup({ children }: DateGroupProps) {
  return <section className="record-date-group">{children}</section>;
}

export function RecordDateGroupHeading({ date, label, relativeLabel }: DateGroupHeadingProps) {
  return (
    <h2 className="record-date-group__heading">
      <time dateTime={date}>
        {relativeLabel ? <strong>{relativeLabel}</strong> : null}
        <span>{label}</span>
      </time>
    </h2>
  );
}

export function RecordDateGroupList({ children }: DateGroupProps) {
  return (
    <Accordion type="single" collapsible className="record-date-groups">
      {children}
    </Accordion>
  );
}
