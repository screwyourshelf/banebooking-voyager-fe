export function harHandling(kapabiliteter: string[] | undefined, handling: string): boolean {
  return kapabiliteter?.includes(handling) ?? false;
}
