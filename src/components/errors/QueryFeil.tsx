import type { ReactNode } from "react";
import { useRef } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stack } from "@/components/layout";
import { cn } from "@/lib/utils";

type Props = {
  error: Error | null;
  isFetching: boolean;
  onRetry: () => void;
  children: ReactNode;
};

export function QueryFeil({ error, isFetching, onRetry, children }: Props) {
  const lastMessageRef = useRef<string | null>(null);

  if (error) lastMessageRef.current = error.message;
  else if (!isFetching) lastMessageRef.current = null;

  const message = lastMessageRef.current;

  if (message) {
    return (
      <Stack gap="sm" className="items-center py-10 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry} disabled={isFetching}>
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          {isFetching ? "Prøver..." : "Prøv igjen"}
        </Button>
      </Stack>
    );
  }

  return <>{children}</>;
}
