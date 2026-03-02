export function harHandling(tillattHandlinger: string[] | undefined, handling: string): boolean {
  return tillattHandlinger?.includes(handling) ?? false;
}
