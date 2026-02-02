import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import type { ReactNode } from "react";

import SlugGate from "@/routes/SlugGate";
import AppBoot from "@/app/AppBoot";
import AppShell from "@/app/AppShell";
import AppFrameSkeleton from "@/components/AppFrameSkeleton";
import { ProtectedRoute } from "./components/ProtectedRoute";

const IndexPage = lazy(() => import("./pages/IndexPage"));
const MinSide = lazy(() => import("./features/minside/pages/MinSidePage"));
const KlubbPage = lazy(() => import("./features/klubb/pages/KlubbPage"));
const BanerPage = lazy(() => import("./pages/admin/BanerPage"));
const ArrangementPage = lazy(() => import("./pages/utvidet/ArrangementPage"));
const KommendeArrangementPage = lazy(() => import("./pages/KommendeArrangementPage"));
const BrukerePage = lazy(() => import("./pages/admin/BrukerePage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const VilkaarPage = lazy(() => import("./pages/VilkaarPage"));

const Protected = ({ children }: { children: ReactNode }) => (
    <ProtectedRoute>{children}</ProtectedRoute>
);

export default function App() {
    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Suspense fallback={<AppFrameSkeleton />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/aas-tennisklubb" replace />} />

                    <Route path=":slug?" element={<SlugGate />}>
                        <Route element={<AppBoot><AppShell /></AppBoot>}>
                            <Route path="vilkaar" element={<VilkaarPage />} />
                            <Route index element={<IndexPage />} />
                            <Route path="minside" element={<Protected><MinSide /></Protected>} />
                            <Route path="kommendeArrangement" element={<Protected><KommendeArrangementPage /></Protected>} />
                            <Route path="arrangement" element={<Protected><ArrangementPage /></Protected>} />
                            <Route path="admin/klubb" element={<Protected><KlubbPage /></Protected>} />
                            <Route path="admin/baner" element={<Protected><BanerPage /></Protected>} />
                            <Route path="admin/brukere" element={<Protected><BrukerePage /></Protected>} />
                        </Route>
                    </Route>

                    <Route path="auth/callback" element={<AuthCallbackPage />} />
                    <Route path="*" element={<div className="p-4 text-center">404 – Fant ikke siden</div>} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
