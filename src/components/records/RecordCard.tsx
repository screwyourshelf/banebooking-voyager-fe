import type { MouseEventHandler, ReactNode } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type ChildrenProps = {
  children: ReactNode;
};

type CardProps = ChildrenProps & {
  as?: "div" | "article";
  muted?: boolean;
};

type CardButtonProps = ChildrenProps & {
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  ariaLabel: string;
};

type AccordionCardProps = ChildrenProps & {
  value: string;
  muted?: boolean;
};

type SummaryProps = ChildrenProps & {
  layout?: "default" | "slot" | "time" | "date";
};

export function RecordCard({ children, as: Tag = "div", muted = false }: CardProps) {
  return (
    <Tag className="record-card" data-muted={muted || undefined} data-record-card="">
      {children}
    </Tag>
  );
}

export function RecordCardButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
}: CardButtonProps) {
  return (
    <button
      type="button"
      className="record-card record-card__static record-card-button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      data-record-card=""
    >
      {children}
    </button>
  );
}

export function RecordAccordionCard({ children, value, muted = false }: AccordionCardProps) {
  return (
    <AccordionItem
      value={value}
      className="record-card"
      data-muted={muted || undefined}
      data-record-card=""
    >
      {children}
    </AccordionItem>
  );
}

export function RecordCardStatic({ children }: ChildrenProps) {
  return <div className="record-card__static">{children}</div>;
}

export function RecordCardTrigger({ children }: ChildrenProps) {
  return (
    <AccordionTrigger className="record-card__trigger hover:no-underline">
      {children}
    </AccordionTrigger>
  );
}

export function RecordCardSummary({ children, layout = "default" }: SummaryProps) {
  return (
    <div className="record-card__summary" data-layout={layout}>
      {children}
    </div>
  );
}

export function RecordCardDetails({ children }: ChildrenProps) {
  return <AccordionContent className="record-card__details">{children}</AccordionContent>;
}

export function RecordCardActions({ children }: ChildrenProps) {
  return <div className="record-card__actions">{children}</div>;
}
