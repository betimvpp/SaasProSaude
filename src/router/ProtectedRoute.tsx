import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { UnAuthorized } from "@/pages/app/UnAuthorized";
import { ReactNode } from "react";
import { useCollaboratorCache } from "@/lib/useCollaboratorCache";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const { collaboratorData, isLoading } = useCollaboratorCache();

  if (isLoading) return null; 

  if (!user) return <Navigate to="/login" replace />;
  if (collaboratorData && !allowedRoles.includes(collaboratorData.role)) return <UnAuthorized />;

  return <>{children ? children : <Outlet />}</>;
}
