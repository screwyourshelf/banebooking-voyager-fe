import type { ReactNode } from "react";
import Page from "@/components/Page";
import PageHeader from "@/components/layout/PageHeader";
import { RecordCollection } from "@/components/records";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

export default function AdminPage({ eyebrow, title, description, action, children }: Props) {
  return (
    <Page width="xl" className="admin-page">
      <div className="admin-page__content">
        <div className="admin-page__intro">
          <PageHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            className="admin-page__heading"
          />
          {action ? <div className="admin-page__create">{action}</div> : null}
        </div>

        {children}
      </div>
    </Page>
  );
}

export function AdminPageLoading({ label }: { label: string }) {
  return <div className="admin-page__loading" aria-label={label} />;
}

export function AdminPageState({ children }: { children: ReactNode }) {
  return <RecordCollection>{children}</RecordCollection>;
}
