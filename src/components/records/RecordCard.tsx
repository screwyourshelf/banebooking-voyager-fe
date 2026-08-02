import type { MouseEventHandler, ReactNode } from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AccordionContent, AccordionItem } from "@/components/ui/accordion";

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

type StaticProps = ChildrenProps & {
  layout?: "default" | "content-action";
};

type AccordionCardProps = ChildrenProps & {
  value: string;
  muted?: boolean;
};

type SummaryProps = ChildrenProps & {
  layout?: "default" | "slot" | "time" | "date";
};

type DisclosureProps = {
  ariaLabel: string;
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

export function RecordCardStatic({ children, layout = "default" }: StaticProps) {
  return (
    <div className="record-card__static" data-layout={layout}>
      {children}
    </div>
  );
}

export function RecordCardTrigger({ children }: ChildrenProps) {
  return (
    <AccordionPrimitive.Header className="record-card__trigger-header">
      <AccordionPrimitive.Trigger className="record-card__trigger">
        {children}
        <ChevronDown
          aria-hidden="true"
          data-slot="accordion-trigger-icon"
          className="record-card__disclosure-open-icon"
        />
        <ChevronUp
          aria-hidden="true"
          data-slot="accordion-trigger-icon"
          className="record-card__disclosure-close-icon"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function RecordCardDisclosureToggle({ ariaLabel }: DisclosureProps) {
  return (
    <AccordionPrimitive.Header className="record-card__disclosure-header">
      <AccordionPrimitive.Trigger className="record-card__disclosure-toggle" aria-label={ariaLabel}>
        <ChevronDown aria-hidden="true" className="record-card__disclosure-open-icon" />
        <ChevronUp aria-hidden="true" className="record-card__disclosure-close-icon" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
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
