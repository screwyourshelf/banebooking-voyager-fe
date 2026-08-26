import { createContext } from "svelte";

export type NavigationLayout = "sidebar" | "bottom" | "section" | "actions";
export type NavigationSurface = "control" | "overlay" | "shell";

export type NavigationContext = {
  readonly layout: NavigationLayout;
  readonly surface: NavigationSurface;
};

const [getNavigationContext, setNavigationContext] = createContext<NavigationContext | undefined>();
export { setNavigationContext };

export function requireNavigationContext(): NavigationContext {
  const context = getNavigationContext();
  if (!context) {
    throw new Error(
      "Navigation children must be rendered inside Navigation so layout and surface stay explicit."
    );
  }
  return context;
}

export function getOptionalNavigationContext(): NavigationContext | undefined {
  try {
    return getNavigationContext();
  } catch {
    return undefined;
  }
}
