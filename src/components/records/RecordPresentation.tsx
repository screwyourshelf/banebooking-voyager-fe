import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function RecordDateRange({ start, end }: { start: ReactNode; end?: ReactNode }) {
  return (
    <span className="record-date-range">
      <strong>{start}</strong>
      {end ? <small>– {end}</small> : null}
    </span>
  );
}

export function RecordIdentity({
  title,
  description,
  leading,
  meta,
}: {
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <span className="record-identity">
      {leading ? <span className="record-identity__leading">{leading}</span> : null}
      <span className="record-identity__copy">
        <span className="record-identity__title">{title}</span>
        {description ? <span className="record-identity__description">{description}</span> : null}
        {meta ? <span className="record-identity__meta">{meta}</span> : null}
      </span>
    </span>
  );
}

export function RecordDetailsLayout({ children }: { children: ReactNode }) {
  return <div className="record-details-layout">{children}</div>;
}

export function RecordProgram({
  children,
  label = "Program",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <section className="record-program" aria-label={label}>
      {children}
    </section>
  );
}

export function RecordProgramHeader({
  title,
  summary,
  expanded,
  controls,
  onToggle,
}: {
  title: ReactNode;
  summary: ReactNode;
  expanded: boolean;
  controls: string;
  onToggle: () => void;
}) {
  return (
    <div className="record-program__header">
      <span>
        <strong>{title}</strong>
        <small>{summary}</small>
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-expanded={expanded}
        aria-controls={controls}
        onClick={onToggle}
      >
        {expanded ? "Skjul program" : "Vis program"}
      </Button>
    </div>
  );
}

export function RecordProgramDays({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div id={id} className="record-program__days">
      {children}
    </div>
  );
}

export function RecordProgramDay({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="record-program__day">
      <h4>{title}</h4>
      <div className="record-program__slots">{children}</div>
    </section>
  );
}

export function RecordProgramSlot({ time, children }: { time: ReactNode; children: ReactNode }) {
  return (
    <div className="record-program__slot">
      <time>{time}</time>
      <span>{children}</span>
    </div>
  );
}

export function RecordProgramMore({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="record-program__more"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function RecordEmptyNote({ children }: { children: ReactNode }) {
  return <p className="record-empty-note">{children}</p>;
}

export function RecordDetailGrid({ children }: { children: ReactNode }) {
  return <dl className="record-detail-grid">{children}</dl>;
}

export function RecordDetailItem({
  icon,
  label,
  children,
}: {
  icon?: ReactNode;
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <dt>
        {icon}
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

export function RecordLinkButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="record-link-button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {children}
    </button>
  );
}
