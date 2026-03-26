import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Stack } from "@/components/layout";

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
    <Stack gap="xl" className="items-center py-12 px-6 text-center">
      <Icon className="h-16 w-16 text-muted-foreground" />

      <Stack gap="xs" className="items-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </Stack>

      {children}

      {isDev && error && (
        <pre className="rounded-md border bg-muted px-4 py-3 text-xs text-left w-full min-w-0 overflow-x-auto text-destructive whitespace-pre-wrap break-words">
          {error instanceof Error
            ? `${error.name}: ${error.message}${error.stack ? `\n\n${error.stack}` : ""}`
            : String(error)}
        </pre>
      )}
    </Stack>
  );
}
