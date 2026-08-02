import type { ReactNode } from "react";

export type ContentDocumentFact = {
  label: string;
  value: ReactNode;
};

export function ContentDocument({ children }: { children: ReactNode }) {
  return <article className="content-document">{children}</article>;
}

export function ContentDocumentIntro({ children }: { children: ReactNode }) {
  return <div className="content-document__intro">{children}</div>;
}

export function ContentDocumentSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="content-document__section">
      <h2>{title}</h2>
      <div className="content-document__body">{children}</div>
    </section>
  );
}

export function ContentDocumentFacts({ items }: { items: readonly ContentDocumentFact[] }) {
  return (
    <dl className="content-document__facts">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
