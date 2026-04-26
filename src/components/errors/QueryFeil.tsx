import type { ReactNode } from "react";
import { useState } from "react";
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
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  // Latch error message during retry (render-time adjust)
  if (error && lastMessage !== error.message) {
    setLastMessage(error.message);
  } else if (!error && !isFetching && lastMessage !== null) {
    setLastMessage(null);
  }

  const message = error?.message ?? lastMessage;

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
