import { createContext } from "svelte";
import type { Theme } from "./theme";

export type ThemeContext = {
  readonly current: Theme;
  set(theme: Theme): void;
  toggle(): void;
};

export const [getThemeContext, setThemeContext] = createContext<ThemeContext>();
