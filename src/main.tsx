import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import BootHandoff from "./app/BootHandoff";
import { ReactQueryDevtoolsPanel } from "./components/ReactQueryDevtoolsPanel";
import AuthProvider from "./providers/AuthProvider";
import { prefetchCurrentRoute } from "./utils/prefetchRoute";
import "./index.css";

const recoveryUrl = new URL(window.location.href);
if (recoveryUrl.searchParams.has("_app_reload")) {
  recoveryUrl.searchParams.delete("_app_reload");
  window.history.replaceState(
    window.history.state,
    "",
    `${recoveryUrl.pathname}${recoveryUrl.search}${recoveryUrl.hash}`
  );
}

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
