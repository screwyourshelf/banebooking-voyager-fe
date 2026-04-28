import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useMemo } from "react";

import SlugGate from "@/routes/SlugGate";
import { routeConfig, flattenRoutes } from "@/routes/routeConfig";
import { SperretGuard } from "@/routes/SperretGuard";
import { MedlemskapGuard } from "@/routes/MedlemskapGuard";
import AppBoot from "@/app/AppBoot";
import AppShell from "@/app/AppShell";
import { AppFrameSkeleton } from "@/components/loading";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppErrorBoundary } from "@/components/errors";

const AuthCallbackPage = lazy(() => import("./app/AuthCallbackPage"));
const SperretPage = lazy(() => import("@/features/sperre/pages/SperretPage"));
const BekreftMedlemskapPage = lazy(
  () => import("@/features/medlemskap/pages/BekreftMedlemskapPage")
);
const VilkaarPage = lazy(() => import("@/features/policy/pages/VilkaarPage"));
const NotFoundPage = lazy(() => import("@/features/errors/pages/NotFoundPage"));

export default function App() {
  const appRoutes = useMemo(
    () => flattenRoutes(routeConfig).filter((r) => r.component && r.path !== "vilkaar"),
    []
  );

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AppErrorBoundary>
            <Suspense fallback={<AppFrameSkeleton />}>
              <Routes>
                <Route path="/" element={<Navigate to="/aas-tennisklubb" replace />} />

                <Route path=":slug?" element={<SlugGate />}>
                  <Route
                    element={
                      <AppBoot>
                        <AppShell />
                      </AppBoot>
                    }
                  >
                    <Route element={<SperretGuard />}>
                      <Route element={<MedlemskapGuard />}>
                        {appRoutes.map((route) => {
                          const Component = route.component!;

                          const element = route.protected ? (
                            <ProtectedRoute>
                              <Component />
                            </ProtectedRoute>
                          ) : (
                            <Component />
                          );

                          return route.index ? (
                            <Route key="index" index element={element} />
                          ) : (
                            <Route key={route.fullPath} path={route.fullPath} element={element} />
                          );
                        })}
                      </Route>

                      <Route path="bekreft-medlemskap" element={<BekreftMedlemskapPage />} />
                      <Route path="vilkaar" element={<VilkaarPage />} />
                    </Route>

                    <Route path="sperret" element={<SperretPage />} />
                  </Route>
                </Route>

                <Route path="auth/callback" element={<AuthCallbackPage />} />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </AppErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}
