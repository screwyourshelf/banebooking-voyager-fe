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
    <div className="flex flex-col items-center gap-6 py-12 px-6 text-center">
      <Icon className="h-16 w-16 text-muted-foreground" />

      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {children}

      {isDev && error && (
        <pre className="rounded-md border bg-muted px-4 py-3 text-xs text-left w-full min-w-0 overflow-x-auto text-destructive whitespace-pre-wrap break-words">
          {error instanceof Error
            ? `${error.name}: ${error.message}${error.stack ? `\n\n${error.stack}` : ""}`
            : String(error)}
        </pre>
      )}
    </div>
  );
}
