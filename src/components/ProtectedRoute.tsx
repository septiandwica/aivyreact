import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Checking session...</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <Outlet />;
}
