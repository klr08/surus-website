import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Insights from './pages/Insights';
import About from './pages/About';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './components/admin/AdminLayout';
import AdminGuard from './components/admin/AdminGuard';
import ErrorBoundary from './components/ErrorBoundary';

import '../public/css/style.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'insights', element: <Insights /> },
      { path: 'about', element: <About /> },
    ],
  },
  {
    path: '/admin/login',
    element: (
      <ErrorBoundary>
        <AdminLogin />
      </ErrorBoundary>
    ),
  },
  {
    path: '/admin',
    element: (
      <ErrorBoundary>
        <AdminGuard>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AdminGuard>
      </ErrorBoundary>
    ),
  },
  {
    path: '*',
    element: (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/">Go Home</a>
      </div>
    ),
  },
]);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);


