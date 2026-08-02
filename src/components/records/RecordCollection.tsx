import type { ReactNode } from "react";

type CollectionProps = {
  children: ReactNode;
  ariaLabel?: string;
  busy?: boolean;
};

type ChildrenProps = {
  children: ReactNode;
};

export function RecordCollection({ children, ariaLabel, busy = false }: CollectionProps) {
  return (
    <section className="record-collection" aria-label={ariaLabel} aria-busy={busy || undefined}>
      {children}
    </section>
  );
}

export function RecordCollectionBody({ children }: ChildrenProps) {
  return <div className="record-collection__body">{children}</div>;
}

export function RecordCollectionPagination({ children }: ChildrenProps) {
  return <div className="record-collection__pagination">{children}</div>;
}
