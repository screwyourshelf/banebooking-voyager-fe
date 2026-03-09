import { lazy, Suspense } from "react";

const ReactQueryDevtoolsLazy = lazy(() =>
  import("@tanstack/react-query-devtools").then((m) => ({
    default: m.ReactQueryDevtools,
  }))
);

export function ReactQueryDevtoolsPanel() {
  return (
    <Suspense fallback={null}>
      <ReactQueryDevtoolsLazy initialIsOpen={false} />
    </Suspense>
  );
}
