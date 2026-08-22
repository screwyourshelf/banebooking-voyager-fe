import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme, readStoredTheme, storeAndApplyTheme } from "./browser-theme.client";
import { THEME_STORAGE_KEY } from "./theme";

const storage = vi.hoisted(() => ({
  read: vi.fn<(key: string) => string | null>(),
  write: vi.fn<(key: string, value: string) => boolean>(),
}));

vi.mock("$lib/platform/storage/browser-storage.client", () => ({
  lesLokalLagring: storage.read,
  skrivLokalLagring: storage.write,
}));

function createThemeRoot() {
  const classes = new Set<string>();
  const style = { colorScheme: "" };

  return {
    classes,
    root: {
      classList: {
        add: (...tokens: string[]) => tokens.forEach((token) => classes.add(token)),
        contains: (token: string) => classes.has(token),
        remove: (...tokens: string[]) => tokens.forEach((token) => classes.delete(token)),
      },
      style,
    },
    style,
  };
}

beforeEach(() => {
  const themeRoot = createThemeRoot();
  vi.stubGlobal("document", { documentElement: themeRoot.root });
  storage.read.mockReset();
  storage.write.mockReset();
  storage.write.mockReturnValue(true);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("browser theme adapter", () => {
  it("preserves the existing storage key and ignores unsupported values", () => {
    storage.read.mockReturnValue("dark");
    expect(readStoredTheme()).toBe("dark");

    storage.read.mockReturnValue("system");
    expect(readStoredTheme("light")).toBe("light");
    expect(storage.read).toHaveBeenCalledWith(THEME_STORAGE_KEY);
  });

  it("applies exactly one theme class and matching browser color scheme", () => {
    const { classes, root, style } = createThemeRoot();
    classes.add("light");

    applyTheme("dark", root);

    expect(classes).toEqual(new Set(["dark"]));
    expect(style.colorScheme).toBe("dark");
  });

  it("stores and applies a user selection through the platform storage boundary", () => {
    storeAndApplyTheme("dark");

    expect(storage.write).toHaveBeenCalledWith(THEME_STORAGE_KEY, "dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});
