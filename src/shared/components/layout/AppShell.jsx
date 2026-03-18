/**
 * AppShell — Modern master layout with dark/light theme support.
 * Features: sidebar + header + content area with smooth transitions.
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { ToastStack } from "../ui/Toast.jsx";
import { useFacility } from "../../context/FacilityContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { facility } = useFacility();
  const { theme } = useTheme();

  const segment = facility?.segment || "clinic";

  return (
    <div
      className="flex h-screen overflow-hidden bg-background transition-colors duration-300"
      data-segment={segment}
    >
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <ToastStack />
    </div>
  );
}
