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
    <article data-ui="error-display">
      <header data-part="header">
        <span data-part="eyebrow">Banebooking</span>
        <span data-part="icon">
          <Icon aria-hidden="true" />
        </span>
      </header>

      <div data-part="content">
        <div data-part="intro">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        {children ? <div data-part="actions">{children}</div> : null}

        {isDev && error ? (
          <pre data-part="details">
            {error instanceof Error
              ? `${error.name}: ${error.message}${error.stack ? `\n\n${error.stack}` : ""}`
              : String(error)}
          </pre>
        ) : null}
      </div>
    </article>
  );
}
