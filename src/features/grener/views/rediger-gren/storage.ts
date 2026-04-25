export const STORAGE_KEY = "rediger.valgtGrenId";

export function loadValgtGrenId(): string | null {
  const v = sessionStorage.getItem(STORAGE_KEY);
  return v && v !== "null" ? v : null;
}

export function saveValgtGrenId(id: string | null) {
  sessionStorage.setItem(STORAGE_KEY, id ?? "null");
}
