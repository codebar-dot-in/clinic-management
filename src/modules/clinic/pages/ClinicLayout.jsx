import { Navigate, Outlet } from "react-router-dom";
import { ClinicProvider } from "../context/ClinicContext.jsx";

export function ClinicLayout() {
  return (
    <ClinicProvider>
      <Outlet />
    </ClinicProvider>
  );
}
