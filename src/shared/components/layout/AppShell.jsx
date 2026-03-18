/**
 * AppShell — master layout: sidebar + header + content area.
 * All module pages render inside <Outlet />.
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { ToastStack } from "../ui/Toast.jsx";
import { useFacility } from "../../context/FacilityContext.jsx";
import { SEGMENT_THEME } from "../../constants/tokens.js";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { facility } = useFacility();

  const theme = facility?.segment ? SEGMENT_THEME[facility.segment] : SEGMENT_THEME.clinic;

  return (
    // CSS custom properties expose the segment theme to all child components
    <div
      className="flex h-screen overflow-hidden bg-slate-50"
      style={{
        "--seg-primary": theme.primary,
        "--seg-bg":      theme.bg,
        "--seg-border":  theme.border,
        "--seg-gradient": theme.gradient,
      }}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <ToastStack />
    </div>
  );
}
