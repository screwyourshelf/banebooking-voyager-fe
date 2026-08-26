export type UnauthorizedEffect = () => Promise<void> | void;

/**
 * Slår sammen samtidige 401-responser til én kontrollert effekt. En senere,
 * separat 401 kan starte en ny håndtering etter at den første er ferdig.
 */
export function createUnauthorizedHandler(effect: UnauthorizedEffect): () => Promise<void> {
  let inFlight: Promise<void> | null = null;

  return () => {
    if (inFlight) return inFlight;

    inFlight = Promise.resolve()
      .then(effect)
      .finally(() => {
        inFlight = null;
      });

    return inFlight;
  };
}
