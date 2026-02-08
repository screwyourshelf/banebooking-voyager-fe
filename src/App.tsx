import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import SlugGate from "@/routes/SlugGate";
import { routeConfig, flattenRoutes } from "@/routes/routeConfig";
import AppBoot from "@/app/AppBoot";
import AppShell from "@/app/AppShell";
import { AppFrameSkeleton } from "@/components/loading";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

const AuthCallbackPage = lazy(() => import("./app/AuthCallbackPage"));

// Generer flate ruter fra config
const appRoutes = flattenRoutes(routeConfig).filter((r) => r.component);

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
          </Route>

          <Route path="auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<div className="p-4 text-center">404 – Fant ikke siden</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
