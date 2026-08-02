import { lazy, Suspense, useEffect, useState } from "react";

const ReactQueryDevtoolsLazy = lazy(() =>
  import("@tanstack/react-query-devtools").then((m) => ({
    default: m.ReactQueryDevtools,
  }))
);

export function ReactQueryDevtoolsPanel() {
  const [desktopViewport, setDesktopViewport] = useState(
    () => window.matchMedia("(min-width: 48rem)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 48rem)");
    const updateViewport = () => setDesktopViewport(mediaQuery.matches);

    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  if (!desktopViewport) return null;

  return (
    <Suspense fallback={null}>
      <ReactQueryDevtoolsLazy initialIsOpen={false} />
    </Suspense>
  );
}
