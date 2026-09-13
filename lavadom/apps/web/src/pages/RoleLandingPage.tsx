import { Navigate } from "react-router-dom";
import { authStore } from "../store/auth";
import { parseJwt } from "../lib/validators";
import HomePage from "./client/HomePage";

export default function RoleLandingPage() {
  const token = authStore.getAccessToken();
  if (!token) return <HomePage />;

  const role = parseJwt(token)?.role as "ADMIN" | "PROVIDER" | "CLIENT" | undefined;
  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "PROVIDER") return <Navigate to="/provider" replace />;
  if (role === "CLIENT") return <Navigate to="/client" replace />;

  return <HomePage />;
}
