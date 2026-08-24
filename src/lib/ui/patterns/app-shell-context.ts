import { createContext } from "svelte";

export type AppShellBackground = "canvas" | "court";

export type AppShellContext = {
  readonly background: AppShellBackground;
};

const [getAppShellContext, setAppShellContext] = createContext<AppShellContext | undefined>();
export { setAppShellContext };

export function getOptionalAppShellContext(): AppShellContext | undefined {
  try {
    return getAppShellContext();
  } catch {
    return undefined;
  }
}
