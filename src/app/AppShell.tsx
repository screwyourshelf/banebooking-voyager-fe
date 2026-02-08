import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import BreadcrumbMedSti from "@/components/BreadcrumbMedSti";
import FeedAlerts from "@/components/Feed/FeedAlerts";
import "animate.css";

export default function AppShell() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="w-full max-w-screen-sm mx-auto px-4 py-4 flex-1 flex">
        <div className="bg-white rounded-md shadow-sm overflow-hidden w-full flex flex-col">
          <header className="bg-gradient-to-b from-gray-200 to-white border-b border-gray-300 shadow-sm">
            <Navbar />
          </header>

          <BreadcrumbMedSti />

          <div className="mx-1">
            <FeedAlerts />
          </div>

          {/* Viktig: flex-1 s� main fyller resten av h�yden */}
          <main className="py-1 px-1 flex-1 min-h-0">
            <div className="animate__animated animate__fadeIn animate__faster">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <Toaster
        position="top-center"
        mobileOffset={{ top: "35vh" }}
        offset={{ top: "35vh" }}
        duration={1500}
      />
    </div>
  );
}
