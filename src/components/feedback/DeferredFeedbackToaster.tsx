import { lazy, Suspense, useEffect, useState } from "react";

const GlobalFeedbackToaster = lazy(() => import("./FeedbackToaster"));

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

export default function DeferredFeedbackToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idleWindow = window as IdleWindow;

    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(() => setReady(true), { timeout: 1_000 });
      return () => idleWindow.cancelIdleCallback?.(handle);
    }

    const handle = window.setTimeout(() => setReady(true), 500);
    return () => window.clearTimeout(handle);
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <GlobalFeedbackToaster />
    </Suspense>
  );
}
