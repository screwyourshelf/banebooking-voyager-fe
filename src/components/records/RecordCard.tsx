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
  "data-ui"?: string;
  "data-variant"?: string;
};

type CardButtonProps = ChildrenProps & {
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  ariaLabel: string;
  "data-ui"?: string;
};

type StaticProps = ChildrenProps & {
  action?: ReactNode;
};

type AccordionCardProps = ChildrenProps & {
  value: string;
  muted?: boolean;
};

type TriggerProps = ChildrenProps & {
  action?: ReactNode;
};

export function RecordCard({
  children,
  as: Tag = "div",
  muted = false,
  "data-ui": dataUi,
  "data-variant": dataVariant,
}: CardProps) {
  return (
    <Tag
      data-surface="record-card"
      data-ui={dataUi}
      data-variant={dataVariant}
      data-muted={muted || undefined}
    >
      {children}
    </Tag>
  );
}

export function RecordCardButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  "data-ui": dataUi,
}: CardButtonProps) {
  return (
    <button
      type="button"
      data-surface="record-card"
      data-ui={dataUi}
      data-part="static"
      data-interactive="true"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function RecordAccordionCard({ children, value, muted = false }: AccordionCardProps) {
  return (
    <AccordionItem value={value} data-surface="record-card" data-muted={muted || undefined}>
      {children}
    </AccordionItem>
  );
}

export function RecordCardStatic({ children, action }: StaticProps) {
  const content = (
    <div data-ui="record-card-static" data-part="static">
      {children}
    </div>
  );

  if (!action) return content;

  return (
    <div data-part="row">
      {content}
      <div data-part="row-action">{action}</div>
    </div>
  );
}

export function RecordCardTrigger({ children, action }: TriggerProps) {
  return (
    <div data-part="row">
      <AccordionPrimitive.Header data-part="trigger-header">
        <AccordionPrimitive.Trigger data-ui="record-card-trigger" data-part="trigger">
          {children}
          <ChevronDown
            aria-hidden="true"
            data-slot="accordion-trigger-icon"
            data-part="open-icon"
          />
          <ChevronUp aria-hidden="true" data-slot="accordion-trigger-icon" data-part="close-icon" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      {action ? <div data-part="row-action">{action}</div> : null}
    </div>
  );
}

export function RecordCardDetails({ children }: ChildrenProps) {
  return (
    <AccordionContent data-ui="record-card-details" data-part="details">
      {children}
    </AccordionContent>
  );
}

export function RecordCardActions({ children }: ChildrenProps) {
  return (
    <div data-ui="record-card-actions" data-part="actions">
      {children}
    </div>
  );
}
