import { Children, isValidElement, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import {
  RecordAccordionCard,
  RecordCard,
  RecordCardActions,
  RecordCardButton,
  RecordCardDetails,
  RecordCardStatic,
  RecordCardTrigger,
} from "@/components/records/RecordCard";
import { RecordCollection, RecordCollectionBody } from "@/components/records/RecordCollection";
import RecordCollectionHeader, {
  type RecordCollectionFilter,
  type RecordCollectionSelection,
  type RecordCollectionToggle,
} from "@/components/records/RecordCollectionHeader";
import {
  RecordAccordionList,
  RecordDateGroup,
  RecordDateGroupHeading,
  RecordDateGroupList,
} from "@/components/records/RecordList";
import { RecordDetailsLayout } from "@/components/records/RecordPresentation";
import RecordStatus, {
  type RecordStatusAppearance,
  type RecordStatusTone,
} from "@/components/records/RecordStatus";
import { Button } from "@/components/ui/button";

type CollectionProps = {
  icon: ReactNode;
  title: string;
  scope?: ReactNode;
  notice?: ReactNode;
  contextAction?: ReactNode;
  toggle?: RecordCollectionToggle;
  filter?: RecordCollectionFilter;
  selection?: RecordCollectionSelection;
  busy?: boolean;
  children: ReactNode;
};

export function CollectionFrame({
  icon,
  title,
  scope,
  notice,
  contextAction,
  toggle,
  filter,
  selection,
  busy = false,
  children,
}: CollectionProps) {
  return (
    <RecordCollection ariaLabel={title} busy={busy}>
      <RecordCollectionHeader
        icon={icon}
        title={title}
        scope={scope}
        notice={notice}
        contextAction={contextAction}
        toggle={toggle}
        filter={filter}
        selection={selection}
      />
      <RecordCollectionBody>{children}</RecordCollectionBody>
    </RecordCollection>
  );
}

type ListProps = {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  loading?: boolean;
  ariaLabel?: string;
};

export function CollectionList(props: ListProps) {
  const grouped = Children.toArray(props.children).some(
    (child) => isValidElement(child) && child.type === CollectionGroup
  );

  if (grouped) {
    return <RecordDateGroupList loading={props.loading}>{props.children}</RecordDateGroupList>;
  }

  return <RecordAccordionList {...props} />;
}

export function CollectionGroup({ children }: { children: ReactNode }) {
  return <RecordDateGroup>{children}</RecordDateGroup>;
}

export function CollectionGroupHeading({
  date,
  label,
  relativeLabel,
}: {
  date: string;
  label: string;
  relativeLabel?: string | null;
}) {
  return <RecordDateGroupHeading date={date} label={label} relativeLabel={relativeLabel} />;
}

type RowStatus = {
  label: ReactNode;
  tone: RecordStatusTone;
  appearance?: RecordStatusAppearance;
};

type ReorderControls = {
  type: "reorder";
  onOpen: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
};

type RowInteraction =
  | { type: "static" }
  | { type: "open"; onOpen: () => void }
  | { type: "action"; action: ReactNode }
  | { type: "actions"; actions: ReactNode }
  | {
      type: "expand";
      value: string;
      details?: ReactNode;
      actions?: ReactNode;
      summaryAction?: ReactNode;
    }
  | ReorderControls;

type RowProps = {
  layout?: "entity" | "schedule";
  leading?: ReactNode;
  title: ReactNode;
  category?: RowStatus;
  context?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  status?: RowStatus;
  interaction?: RowInteraction;
  disabled?: boolean;
  muted?: boolean;
  ariaLabel?: string;
};

function CollectionRowSummary({
  layout = "entity",
  leading,
  title,
  category,
  context,
  description,
  meta,
  status,
}: Pick<
  RowProps,
  "layout" | "leading" | "title" | "category" | "context" | "description" | "meta" | "status"
>) {
  const titleStatus = layout === "entity" ? status : undefined;
  const layoutStatus = layout === "schedule" ? status : undefined;

  return (
    <span
      data-ui="collection-row-summary"
      data-layout={layout}
      data-has-leading={leading ? "true" : undefined}
      data-has-status={status ? "true" : undefined}
    >
      {leading ? <span data-part="leading">{leading}</span> : null}

      {title || category || context || description || meta ? (
        <span data-part="content">
          {title || category || context ? (
            <span data-part="title">
              {category ? (
                <RecordStatus tone={category.tone} appearance={category.appearance}>
                  {category.label}
                </RecordStatus>
              ) : null}
              <span data-part="title-text">{title}</span>
              {context ? <span data-part="context">{context}</span> : null}
              {titleStatus ? (
                <RecordStatus tone={titleStatus.tone} appearance={titleStatus.appearance}>
                  {titleStatus.label}
                </RecordStatus>
              ) : null}
            </span>
          ) : null}
          {description ? <span data-part="description">{description}</span> : null}
          {meta ? <span data-part="meta">{meta}</span> : null}
        </span>
      ) : null}

      {layoutStatus ? (
        <RecordStatus tone={layoutStatus.tone} appearance={layoutStatus.appearance}>
          {layoutStatus.label}
        </RecordStatus>
      ) : null}
    </span>
  );
}

export function CollectionRow({
  interaction = { type: "static" },
  disabled = false,
  muted = false,
  ariaLabel,
  ...summaryProps
}: RowProps) {
  const summary = <CollectionRowSummary {...summaryProps} />;

  if (interaction.type === "expand") {
    return (
      <RecordAccordionCard value={interaction.value} muted={muted}>
        <RecordCardTrigger action={interaction.summaryAction}>{summary}</RecordCardTrigger>
        <RecordCardDetails>
          <RecordDetailsLayout>
            {interaction.details}
            {interaction.actions ? (
              <RecordCardActions>{interaction.actions}</RecordCardActions>
            ) : null}
          </RecordDetailsLayout>
        </RecordCardDetails>
      </RecordAccordionCard>
    );
  }

  if (interaction.type === "reorder") {
    return (
      <RecordCard muted={muted} data-ui="collection-row" data-variant="ordered">
        <button
          type="button"
          data-part="select"
          aria-label={ariaLabel ?? `Åpne ${String(summaryProps.title ?? "oppføring")}`}
          onClick={interaction.onOpen}
          disabled={disabled}
        >
          {summary}
          <ChevronRight aria-hidden="true" data-part="indicator" />
        </button>

        <div
          data-part="actions"
          aria-label={`Rekkefølge for ${String(summaryProps.title ?? "oppføring")}`}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Flytt ${String(summaryProps.title ?? "oppføring")} opp`}
            title="Flytt opp"
            onClick={interaction.onMoveUp}
            disabled={disabled || interaction.disableMoveUp}
          >
            <ArrowUp aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Flytt ${String(summaryProps.title ?? "oppføring")} ned`}
            title="Flytt ned"
            onClick={interaction.onMoveDown}
            disabled={disabled || interaction.disableMoveDown}
          >
            <ArrowDown aria-hidden="true" />
          </Button>
        </div>
      </RecordCard>
    );
  }

  if (interaction.type === "open") {
    return (
      <RecordCardButton
        data-ui="collection-row"
        ariaLabel={ariaLabel ?? `Åpne ${String(summaryProps.title ?? "oppføring")}`}
        onClick={interaction.onOpen}
        disabled={disabled}
      >
        {summary}
        <ChevronRight aria-hidden="true" data-part="indicator" />
      </RecordCardButton>
    );
  }

  if (interaction.type === "action") {
    return (
      <RecordCard as="article" muted={muted} data-ui="collection-row" data-variant="action">
        <RecordCardStatic action={interaction.action}>{summary}</RecordCardStatic>
      </RecordCard>
    );
  }

  if (interaction.type === "actions") {
    return (
      <RecordCard as="article" muted={muted} data-ui="collection-row" data-variant="actions">
        <RecordCardStatic>{summary}</RecordCardStatic>
        <div data-part="actions">
          <RecordCardActions>{interaction.actions}</RecordCardActions>
        </div>
      </RecordCard>
    );
  }

  return (
    <RecordCard as="article" muted={muted} data-ui="collection-row" data-variant="static">
      <RecordCardStatic>{summary}</RecordCardStatic>
    </RecordCard>
  );
}
