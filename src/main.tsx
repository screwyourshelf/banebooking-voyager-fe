import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";

import App from "./App";
import BootHandoff from "./app/BootHandoff";
import { ReactQueryDevtoolsPanel } from "./components/ReactQueryDevtoolsPanel";
import AuthProvider from "./providers/AuthProvider";
import { settLagringsfeilReporter } from "./utils/browserStorage";
import { prefetchCurrentRoute } from "./utils/prefetchRoute";
import "./index.css";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

Sentry.init({
  dsn: sentryDsn,
  enabled: import.meta.env.PROD && Boolean(sentryDsn),
  environment: import.meta.env.MODE,
  dataCollection: {
    userInfo: false,
    httpBodies: [],
  },
});

settLagringsfeilReporter(({ lagringstype, operasjon, feil }) => {
  Sentry.withScope((scope) => {
    scope.setLevel("warning");
    scope.setTag("browser_storage.type", lagringstype);
    scope.setTag("browser_storage.operation", operasjon);
    scope.setContext("browser_storage_error", {
      name: feil instanceof Error ? feil.name : "UnknownError",
      message: feil instanceof Error ? feil.message : "Ukjent lagringsfeil",
    });
    Sentry.captureMessage("Browser storage is unavailable");
  });
});

prefetchCurrentRoute();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const rootElement = document.getElementById("root")!;

const app = (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BootHandoff>
        <App />
      </BootHandoff>
    </AuthProvider>
    {import.meta.env.DEV && <ReactQueryDevtoolsPanel />}
  </QueryClientProvider>
);

createRoot(rootElement).render(import.meta.env.DEV ? <StrictMode>{app}</StrictMode> : app);
