import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function App(): JSX.Element {
  return (
    <div>
      <header>
        <nav>
          <div className="logo"><h1>Surus</h1></div>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/insights">Insights</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>Contact: hello@surus.io · ©2025 Surus. All Rights Reserved.</p>
      </footer>
    </div>
  );
}


