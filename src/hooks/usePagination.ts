import { useState } from "react";

export function usePagination<T>(items: T[], pageSize: number, resetKey: unknown) {
  const [synligAntall, setSynligAntall] = useState(pageSize);

  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setSynligAntall(pageSize);
  }

  return {
    synlige: items.slice(0, synligAntall),
    harFlere: synligAntall < items.length,
    gjenstaar: items.length - synligAntall,
    visFlere: () => setSynligAntall((prev) => prev + pageSize),
  };
}
