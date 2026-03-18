import { Outlet } from "react-router-dom";
import { AyushProvider } from "../context/AyushContext.jsx";

export function AyushLayout() {
  return (
    <AyushProvider>
      <Outlet />
    </AyushProvider>
  );
}
