import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import DeferredFeedbackToaster from "@/components/feedback/DeferredFeedbackToaster";
import { RouteContentSkeleton } from "@/components/loading";
import { AppSidebar, MobileBottomNav, Navbar } from "@/components/navigation";

export default function AppShell() {
  return (
    <div className="app-shell">
      <div className="app-shell__frame">
        <aside className="app-shell__sidebar">
          <AppSidebar />
        </aside>

        <div className="app-shell__workspace">
          <header className="app-shell__topbar">
            <Navbar />
          </header>

          <main className="app-shell__main">
            <Suspense fallback={<RouteContentSkeleton label="Laster siden" />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>

      <MobileBottomNav />

      <DeferredFeedbackToaster />
    </div>
  );
}
