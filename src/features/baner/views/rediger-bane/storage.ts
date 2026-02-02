export const STORAGE_KEY = "rediger.valgtBaneId";

export function loadValgtBaneId(): string | null {
    const v = sessionStorage.getItem(STORAGE_KEY);
    return v && v !== "null" ? v : null;
}

export function saveValgtBaneId(id: string | null) {
    sessionStorage.setItem(STORAGE_KEY, id ?? "null");
}
