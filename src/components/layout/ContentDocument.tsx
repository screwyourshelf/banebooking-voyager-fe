import type { ReactNode } from "react";

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
