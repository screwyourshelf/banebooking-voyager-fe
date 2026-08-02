import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type ErrorDisplayProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  error?: Error | string | null;
  children?: ReactNode;
};

export function ErrorDisplay({
  icon: Icon,
  title,
  description,
  error,
  children,
}: ErrorDisplayProps) {
  const isDev = import.meta.env.DEV;

  return (
    <article className="error-display">
      <header className="error-display__header">
        <span className="error-display__eyebrow">Banebooking</span>
        <span className="error-display__icon">
          <Icon aria-hidden="true" />
        </span>
      </header>

      <div className="error-display__body">
        <div className="error-display__copy">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        {children ? <div className="error-display__actions">{children}</div> : null}

        {isDev && error ? (
          <pre className="error-display__details">
            {error instanceof Error
              ? `${error.name}: ${error.message}${error.stack ? `\n\n${error.stack}` : ""}`
              : String(error)}
          </pre>
        ) : null}
      </div>
    </article>
  );
}
