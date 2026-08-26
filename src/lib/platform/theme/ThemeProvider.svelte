<script lang="ts">
  import { onMount, untrack, type Snippet } from "svelte";
  import { setThemeContext, type ThemeContext } from "./context";
  import { DEFAULT_THEME, toggleTheme, type Theme } from "./theme";

  let { children, defaultTheme = DEFAULT_THEME }: { children: Snippet; defaultTheme?: Theme } =
    $props();

  let current = $state<Theme>(untrack(() => defaultTheme));
  let applyInBrowser: ((theme: Theme) => void) | null = null;
  let hasLocalChange = false;

  function set(theme: Theme) {
    hasLocalChange = true;
    current = theme;
    applyInBrowser?.(theme);
  }

  const theme: ThemeContext = {
    get current() {
      return current;
    },
    set,
    toggle() {
      set(toggleTheme(current));
    },
  };

  setThemeContext(theme);

  onMount(() => {
    let active = true;

    // Asset recovery may intentionally suppress a failed import and resolve without a module.
    // Keep this continuation inert while recovery replaces the current document.
    void import("./browser-theme.client").then((browserTheme) => {
      if (!active || !browserTheme) return;

      applyInBrowser = browserTheme.storeAndApplyTheme;
      if (hasLocalChange) {
        browserTheme.storeAndApplyTheme(current);
      } else {
        current = browserTheme.readStoredTheme(defaultTheme);
        browserTheme.applyTheme(current);
      }
    });

    return () => {
      active = false;
      applyInBrowser = null;
    };
  });
</script>

{@render children()}
