import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './layouts/Layout.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import LoaderSkeleton from './components/LoaderSkeleton.js';

const IndexPage = lazy(() => import('./pages/IndexPage.js'));
const MinSide = lazy(() => import('./pages/MinSidePage.js'));
const KlubbPage = lazy(() => import('./pages/admin/KlubbPage.js'));
const BanerPage = lazy(() => import('./pages/admin/BanerPage.js'));
const ArrangementPage = lazy(() => import('./pages/utvidet/ArrangementPage.js'));
const ReglementPage = lazy(() => import('./pages/ReglementPage.js'));
const BrukerePage = lazy(() => import('./pages/admin/BrukerePage.js'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage.js'));

const Protected = ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute>{children}</ProtectedRoute>
);

export default function App() {
    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Suspense
                fallback={
                    <div className="max-w-screen-sm mx-auto px-4 py-4">
                        <LoaderSkeleton />
                    </div>
                }
            >
                <Routes>
                    <Route path=":slug?" element={<Layout />}>
                        <Route index element={<IndexPage />} />
                        <Route path="minside" element={<Protected><MinSide /></Protected>} />
                        <Route path="reglement" element={<ReglementPage />} />
                        <Route path="arrangement" element={<Protected><ArrangementPage /></Protected>} />
                        <Route path="admin/klubb" element={<Protected><KlubbPage /></Protected>} />
                        <Route path="admin/baner" element={<Protected><BanerPage /></Protected>} />
                        <Route path="admin/brukere" element={<Protected><BrukerePage /></Protected>} />
                    </Route>
                    <Route path="auth/callback" element={<AuthCallbackPage />} />
                    <Route path="*" element={<div className="p-4 text-center">404 – Fant ikke siden</div>} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
