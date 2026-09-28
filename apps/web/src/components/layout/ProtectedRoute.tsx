import { Outlet, Navigate, useLocation } from "react-router-dom";
import { authStore } from "../../store/auth";

export function ProtectedRoute() {
  const loc = useLocation();
  if (!authStore.isAuthed()) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}
