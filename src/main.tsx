import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Insights from './pages/Insights';
import About from './pages/About';
import BlogDetail from './pages/BlogDetail';
import PodcastDetail from './pages/PodcastDetail';
import AdminEnhanced from './pages/AdminEnhanced';

import '../public/css/style.css';
import '../public/css/homepage.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'insights', element: <Insights /> },
      { path: 'insights/blog/:slug', element: <BlogDetail /> },
      { path: 'insights/podcast/:slug', element: <PodcastDetail /> },
      { path: 'about', element: <About /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminEnhanced />,
  },
]);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);


