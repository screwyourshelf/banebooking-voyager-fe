import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AppSidebar, MobileBottomNav, Navbar } from "@/components/navigation";
import "@/styles/animate-fadeIn.css";

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
            <div className="animate__animated animate__fadeIn animate__faster">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav />

      <Toaster
        position="top-center"
        offset={{ top: "35vh" }}
        mobileOffset={{ top: "35vh" }}
        duration={1500}
      />
    </div>
  );
}
