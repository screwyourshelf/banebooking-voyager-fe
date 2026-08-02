import type { ReactNode } from "react";
import { ActionFeedback } from "@/components/feedback";
import { Button } from "@/components/ui/button";

type Props = {
  error: Error | string | null;
  isFetching: boolean;
  onRetry: () => void;
  children?: ReactNode;
  title?: string;
};

export function QueryFeil({
  error,
  isFetching,
  onRetry,
  children,
  title = "Innholdet kunne ikke lastes",
}: Props) {
  const message = typeof error === "string" ? error : error?.message;

  if (message) {
    return (
      <div className="query-feedback">
        <ActionFeedback
          tone="danger"
          title={title}
          description={message}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isFetching}
            >
              {isFetching ? "Prøver igjen…" : "Prøv igjen"}
            </Button>
          }
        />
      </div>
    );
  }

  return children ? <>{children}</> : null;
}
