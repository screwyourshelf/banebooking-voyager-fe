import type { ReactNode } from "react";

export type ContentDocumentFact = {
  label: string;
  value: ReactNode;
};

export function ContentDocument({ children }: { children: ReactNode }) {
  return <article data-ui="document">{children}</article>;
}

export function ContentDocumentIntro({ children }: { children: ReactNode }) {
  return <div data-ui="document-intro">{children}</div>;
}

export function ContentDocumentSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section data-ui="document-section">
      <h2 data-part="title">{title}</h2>
      {description ? <p data-part="description">{description}</p> : null}
      <div data-part="content">{children}</div>
    </section>
  );
}

export function ContentDocumentFacts({ items }: { items: readonly ContentDocumentFact[] }) {
  return (
    <dl data-ui="document-facts">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
