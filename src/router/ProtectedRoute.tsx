import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { UnAuthorized } from "@/pages/app/UnAuthorized";
import { ReactNode, useEffect, useState } from "react";
import { Collaborator, useCollaborator } from "@/contexts/collaboratorContext";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const { getCollaboratorById } = useCollaborator();
  const [collaboratorData, setCollaboratorData] = useState<Collaborator | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (user) {
      getCollaboratorById(user.id)
        .then(data => setCollaboratorData(data))
        .finally(() => setIsCheckingAuth(false));
    } else {
      setIsCheckingAuth(false);
    }
  }, [user, getCollaboratorById]);

  if (isCheckingAuth) return null; 

  if (!user) return <Navigate to="/login" replace />;
  if (collaboratorData && !allowedRoles.includes(collaboratorData.role)) return <UnAuthorized />;

  return <>{children ? children : <Outlet />}</>;
}
