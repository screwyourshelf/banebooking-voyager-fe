import { createContext } from "svelte";

export type FormControlContext = {
  readonly controlId: string;
  readonly descriptionId?: string;
  readonly errorId?: string;
  readonly invalid: boolean;
  readonly required: boolean;
};

export const [getFormControlContext, setFormControlContext] = createContext<
  FormControlContext | undefined
>();

export function getOptionalFormControlContext(): FormControlContext | undefined {
  try {
    return getFormControlContext();
  } catch {
    return undefined;
  }
}

export function mergeAriaIds(...ids: Array<string | null | undefined>): string | undefined {
  const uniqueIds = [...new Set(ids.flatMap((id) => id?.split(/\s+/) ?? []).filter(Boolean))];
  return uniqueIds.length > 0 ? uniqueIds.join(" ") : undefined;
}
