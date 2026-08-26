export function harHandling(
  kapabiliteter: readonly string[] | undefined,
  handling: string
): boolean {
  return kapabiliteter?.includes(handling) ?? false;
}
