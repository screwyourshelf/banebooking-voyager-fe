import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import {
  RecordCollectionToolbar,
  RecordEyebrow,
  RecordStatus,
  type RecordStatusTone,
} from "@/components/records";

type CollectionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  filters?: ReactNode;
  children: ReactNode;
};

export function AdminEntityCollection({
  icon,
  title,
  description,
  filters,
  children,
}: CollectionProps) {
  return (
    <section className="record-collection admin-entity-collection">
      <RecordCollectionToolbar icon={icon} title={title} description={description} />
      {filters}
      <div className="record-collection__body">{children}</div>
    </section>
  );
}

export function AdminEntityList({ children }: { children: ReactNode }) {
  return <div className="record-list admin-entity-list">{children}</div>;
}

type RowProps = {
  title: string;
  meta: string;
  description?: string;
  status: string;
  statusTone: RecordStatusTone;
  onSelect: () => void;
  disabled?: boolean;
};

export function AdminEntityRow({
  title,
  meta,
  description,
  status,
  statusTone,
  onSelect,
  disabled = false,
}: RowProps) {
  return (
    <button
      type="button"
      className="record-card record-card-row record-card__static admin-entity-row"
      aria-label={`Rediger ${title}`}
      onClick={onSelect}
      disabled={disabled}
    >
      <span className="admin-entity-row__copy">
        <RecordEyebrow className="admin-entity-row__meta">{meta}</RecordEyebrow>
        <strong className="admin-entity-row__title">{title}</strong>
        {description ? <span className="admin-entity-row__description">{description}</span> : null}
      </span>

      <span className="admin-entity-row__trailing">
        <RecordStatus tone={statusTone}>{status}</RecordStatus>
        <ChevronRight aria-hidden="true" />
      </span>
    </button>
  );
}
