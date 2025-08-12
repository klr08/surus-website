import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Simple authentication check - in production, use proper JWT validation
    const authToken = localStorage.getItem('surus_admin_auth');
    setIsAuthenticated(Boolean(authToken));
  }, []);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="auth-loading">
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
