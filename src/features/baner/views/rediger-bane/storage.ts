import { lesSessionLagring, skrivSessionLagring } from "@/utils/browserStorage";

export const STORAGE_KEY = "rediger.valgtBaneId";

export function loadValgtBaneId(): string | null {
  const v = lesSessionLagring(STORAGE_KEY);
  return v && v !== "null" ? v : null;
}

export function saveValgtBaneId(id: string | null) {
  skrivSessionLagring(STORAGE_KEY, id ?? "null");
}
