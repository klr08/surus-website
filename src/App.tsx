import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function App(): JSX.Element {
  return (
    <div>
      <header>
        <nav>
          <div className="logo">
            <Link to="/">
              <img src="/images/logos/surus-logo-light.svg" alt="Surus" className="logo-image" />
            </Link>
          </div>
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
        <div className="footer-container">
          <div className="footer-info">
            <div className="footer-logo">
              <img src="/images/logos/surus-logo-dark.svg" alt="Surus" className="footer-logo-image" />
            </div>
            <p className="footer-description">
              Surus is an institutional-grade asset management, custody, and compliance platform for the future of finance, built on top of our licensed and regulated financial institution: Surus Trust Company.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter">X</a>
              <a href="#" aria-label="LinkedIn">LinkedIn</a>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Site Map</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/insights">Insights</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:hello@surus.io">hello@surus.io</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>©2025 Surus. All Rights Reserved. | Privacy Policy | Terms & Conditions | Legal</p>
        </div>
      </footer>
    </div>
  );
}


