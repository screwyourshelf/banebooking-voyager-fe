import { lesSessionLagring, skrivSessionLagring } from "@/utils/browserStorage";

export const STORAGE_KEY = "rediger.valgtGrenId";

export function loadValgtGrenId(): string | null {
  const v = lesSessionLagring(STORAGE_KEY);
  return v && v !== "null" ? v : null;
}

export function saveValgtGrenId(id: string | null) {
  skrivSessionLagring(STORAGE_KEY, id ?? "null");
}
