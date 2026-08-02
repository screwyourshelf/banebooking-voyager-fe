import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import {
  RecordCard,
  RecordCardActions,
  RecordCardButton,
  RecordCardStatic,
  RecordCollection,
  RecordCollectionBody,
  RecordCollectionHeader,
  RecordEyebrow,
  RecordList,
  RecordStatus,
  type RecordCollectionFilter,
  type RecordCollectionToggle,
  type RecordStatusTone,
} from "@/components/records";

type CollectionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  summaryStatus?: ReactNode;
  toggle?: RecordCollectionToggle;
  filter?: RecordCollectionFilter;
  children: ReactNode;
};

export function AdminEntityCollection({
  icon,
  title,
  description,
  summaryStatus,
  toggle,
  filter,
  children,
}: CollectionProps) {
  return (
    <RecordCollection ariaLabel={title}>
      <RecordCollectionHeader
        icon={icon}
        title={title}
        description={description}
        summaryStatus={summaryStatus}
        toggle={toggle}
        filter={filter}
      />
      <RecordCollectionBody>{children}</RecordCollectionBody>
    </RecordCollection>
  );
}

export function AdminEntityList({ children }: { children: ReactNode }) {
  return <RecordList>{children}</RecordList>;
}

type RowProps = {
  title: string;
  meta: string;
  description?: string;
  status: string;
  statusTone: RecordStatusTone;
  onSelect: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

type ActionRowProps = {
  title: string;
  meta: string;
  description?: string;
  status: string;
  statusTone: RecordStatusTone;
  actions?: ReactNode;
  muted?: boolean;
};

export function AdminEntityRow({
  title,
  meta,
  description,
  status,
  statusTone,
  onSelect,
  disabled = false,
  ariaLabel,
}: RowProps) {
  return (
    <RecordCardButton
      ariaLabel={ariaLabel ?? `Rediger ${title}`}
      onClick={onSelect}
      disabled={disabled}
    >
      <span className="admin-entity-row__copy">
        <span className="admin-entity-row__meta">
          <RecordEyebrow>{meta}</RecordEyebrow>
        </span>
        <strong className="admin-entity-row__title">{title}</strong>
        {description ? <span className="admin-entity-row__description">{description}</span> : null}
      </span>

      <span className="admin-entity-row__trailing">
        <RecordStatus tone={statusTone}>{status}</RecordStatus>
        <ChevronRight aria-hidden="true" />
      </span>
    </RecordCardButton>
  );
}

export function AdminActionRow({
  title,
  meta,
  description,
  status,
  statusTone,
  actions,
  muted = false,
}: ActionRowProps) {
  return (
    <RecordCard as="article" muted={muted}>
      <RecordCardStatic>
        <span className="admin-entity-row__copy">
          <span className="admin-entity-row__meta">
            <RecordEyebrow>{meta}</RecordEyebrow>
          </span>
          <strong className="admin-entity-row__title">{title}</strong>
          {description ? (
            <span className="admin-entity-row__description">{description}</span>
          ) : null}
        </span>

        <RecordStatus tone={statusTone}>{status}</RecordStatus>
      </RecordCardStatic>

      {actions ? (
        <div className="admin-action-row__footer">
          <RecordCardActions>{actions}</RecordCardActions>
        </div>
      ) : null}
    </RecordCard>
  );
}
