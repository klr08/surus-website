import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export default function AdminLayout(): JSX.Element {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = (): void => {
    localStorage.removeItem('surus_admin_auth');
    window.location.href = '/';
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-logo">
            <Link to="/admin">Surus Admin</Link>
          </h1>
          <nav className="admin-nav">
            <Link to="/admin" className={isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}>
              Dashboard
            </Link>
            <Link to="/admin/blog" className={isActive('/admin/blog') ? 'active' : ''}>
              Blog Posts
            </Link>
            <Link to="/admin/podcast" className={isActive('/admin/podcast') ? 'active' : ''}>
              Podcast
            </Link>
            <Link to="/admin/team" className={isActive('/admin/team') ? 'active' : ''}>
              Team
            </Link>
            <Link to="/admin/media" className={isActive('/admin/media') ? 'active' : ''}>
              Media
            </Link>
          </nav>
          <div className="admin-user">
            <Link to="/" className="view-site">View Site</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      <footer className="admin-footer">
        <p>Surus Admin - Content Management System</p>
      </footer>
    </div>
  );
}
