import type { ReactNode } from "react";
import PageHeader from "@/components/layout/PageHeader";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function RecordCollectionPage({ eyebrow, title, description, children }: Props) {
  return (
    <div className="record-collection-page">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="record-collection-page__heading"
      />

      {children}
    </div>
  );
}
