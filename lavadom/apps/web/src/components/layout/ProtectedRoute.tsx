import { Outlet, Navigate, useLocation } from "react-router-dom";
import { authStore } from "../../store/auth";
import { parseJwt } from "../../lib/validators";

export function ProtectedRoute({ roles }: { roles?: Array<"CLIENT" | "PROVIDER" | "ADMIN"> }) {
  const loc = useLocation();
  if (!authStore.isAuthed()) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (roles?.length) {
    const role = parseJwt(authStore.getAccessToken() ?? "")?.role;
    if (!role || !roles.includes(role)) return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
