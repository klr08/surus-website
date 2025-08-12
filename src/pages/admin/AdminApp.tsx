import React, { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminApp(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = (): void => {
      const authData = localStorage.getItem('surus_admin_auth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const isValid = parsed.token && parsed.expires > Date.now();
          setIsAuthenticated(isValid);
        } catch {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="auth-loading">
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Show admin dashboard if authenticated
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}
