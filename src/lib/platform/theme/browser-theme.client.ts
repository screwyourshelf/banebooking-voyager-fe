import { lesLokalLagring, skrivLokalLagring } from "$lib/platform/storage/browser-storage.client";
import { DEFAULT_THEME, resolveTheme, THEME_STORAGE_KEY, type Theme } from "./theme";

type ThemeRoot = {
  classList: Pick<DOMTokenList, "add" | "remove">;
  style: Pick<CSSStyleDeclaration, "colorScheme">;
};

export function readStoredTheme(fallback: Theme = DEFAULT_THEME): Theme {
  return resolveTheme(lesLokalLagring(THEME_STORAGE_KEY), fallback);
}

export function applyTheme(theme: Theme, root: ThemeRoot = document.documentElement): void {
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function storeAndApplyTheme(theme: Theme): void {
  skrivLokalLagring(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}
