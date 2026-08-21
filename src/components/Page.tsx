import type { ReactNode } from "react";
import CreateAction, { type CreateActionProps } from "@/components/actions/CreateAction";
import { RecordCollection } from "@/components/records/RecordCollection";
import RecordListState from "@/components/records/RecordListState";
import { Button } from "@/components/ui/button";

export type PageProps = {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  createAction?: CreateActionProps;
};

function PageRoot({
  children,
  className,
  eyebrow,
  title,
  description,
  actions,
  createAction,
}: PageProps) {
  const pageActions = createAction ? <CreateAction {...createAction} /> : actions;
  const hasHeader = Boolean(eyebrow || title || description || pageActions);

  return (
    <div className={className} data-ui="page">
      {hasHeader ? (
        <div data-part="content">
          <header data-part="header">
            <div data-part="intro">
              {eyebrow ? <div data-part="eyebrow">{eyebrow}</div> : null}
              {title ? <h1 data-part="title">{title}</h1> : null}
              {description ? <p data-part="description">{description}</p> : null}
            </div>

            {pageActions ? <div data-part="actions">{pageActions}</div> : null}
          </header>

          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function PageLoading({ label }: { label: string }) {
  return <div data-ui="page-loading" aria-label={label} />;
}

function PageState({ children }: { children: ReactNode }) {
  return <RecordCollection>{children}</RecordCollection>;
}

function PageAccessError({
  error,
  isFetching = false,
  onRetry,
}: {
  error: string;
  isFetching?: boolean;
  onRetry: () => void;
}) {
  return (
    <Page.State>
      <RecordListState
        title="Kunne ikke kontrollere tilgangen"
        description={error}
        action={
          <Button type="button" variant="outline" onClick={onRetry} disabled={isFetching}>
            {isFetching ? "Prøver igjen…" : "Prøv igjen"}
          </Button>
        }
        tone="danger"
        role="alert"
      />
    </Page.State>
  );
}

const Page = Object.assign(PageRoot, {
  Loading: PageLoading,
  State: PageState,
  AccessError: PageAccessError,
});

export default Page;
