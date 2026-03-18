import { Outlet } from "react-router-dom";
import { LabProvider } from "../context/LabContext.jsx";

export function LabLayout() {
  return (
    <LabProvider>
      <Outlet />
    </LabProvider>
  );
}
