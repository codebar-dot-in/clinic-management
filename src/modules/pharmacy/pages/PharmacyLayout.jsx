import { Outlet } from "react-router-dom";
import { PharmacyProvider } from "../context/PharmacyContext.jsx";

export function PharmacyLayout() {
  return (
    <PharmacyProvider>
      <Outlet />
    </PharmacyProvider>
  );
}
