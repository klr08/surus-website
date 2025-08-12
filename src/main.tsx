import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Insights from './pages/Insights';
import About from './pages/About';
import AdminApp from './pages/admin/AdminApp';

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
    path: '/admin/*',
    element: <AdminApp />,
  },
]);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);


