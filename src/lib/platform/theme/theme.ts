export const DEFAULT_THEME = "light" as const;
export const THEME_STORAGE_KEY = "vite-ui-theme";

export type Theme = "light" | "dark";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function resolveTheme(value: unknown, fallback: Theme = DEFAULT_THEME): Theme {
  return isTheme(value) ? value : fallback;
}

export function toggleTheme(theme: Theme): Theme {
  return theme === "light" ? "dark" : "light";
}
