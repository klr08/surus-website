import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ContentSummary } from '../types/content';

export default function Admin(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<ContentSummary>({
    blogPosts: 0,
    podcastEpisodes: 0,
    teamMembers: 0,
    mediaFiles: 0,
  });

  // Check authentication on mount
  useEffect(() => {
    const authData = localStorage.getItem('surus_admin_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const isValid = parsed.token && parsed.expires > Date.now();
        setIsAuthenticated(isValid);
      } catch {
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  // Load content summary when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const loadSummary = async (): Promise<void> => {
        try {
          const blogResponse = await fetch('/data/blog.json');
          const blogData = blogResponse.ok ? await blogResponse.json() : [];
          
          const podcastResponse = await fetch('/data/podcast.json');
          const podcastData = podcastResponse.ok ? await podcastResponse.json() : [];

          setSummary({
            blogPosts: blogData.length || 0,
            podcastEpisodes: podcastData.length || 0,
            teamMembers: 9,
            mediaFiles: 0,
          });
        } catch (error) {
          console.error('Error loading content summary:', error);
          setSummary({
            blogPosts: 4,
            podcastEpisodes: 7,
            teamMembers: 9,
            mediaFiles: 0,
          });
        }
      };

      loadSummary();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      if (credentials.email === 'admin@surus.io' && credentials.password === 'surus2025!') {
        localStorage.setItem('surus_admin_auth', JSON.stringify({
          user: { id: '1', email: credentials.email, role: 'admin' },
          token: 'demo-token',
          expires: Date.now() + (24 * 60 * 60 * 1000)
        }));
        setIsAuthenticated(true);
      } else {
        setLoginError('Invalid email or password');
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem('surus_admin_auth');
    setIsAuthenticated(false);
    setCredentials({ email: '', password: '' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="auth-loading">
        <p>Loading admin...</p>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="login-header">
            <h1>Surus Admin</h1>
            <p>Sign in to manage content</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {loginError && <div className="error-message">{loginError}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="admin@surus.io"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="login-btn"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-help">
            <p>Demo credentials:</p>
            <p><strong>Email:</strong> admin@surus.io</p>
            <p><strong>Password:</strong> surus2025!</p>
          </div>

          <div className="login-footer">
            <Link to="/">← Back to Website</Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-logo">
            <Link to="/admin">Surus Admin</Link>
          </h1>
          <div className="admin-user">
            <Link to="/" className="view-site">View Site</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-content">
          <div className="dashboard">
            <div className="dashboard-header">
              <h1>Content Management Dashboard</h1>
              <p>Manage your Surus website content</p>
            </div>

            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number">{summary.blogPosts}</div>
                <div className="stat-label">Blog Posts</div>
              </div>

              <div className="stat-card">
                <div className="stat-number">{summary.podcastEpisodes}</div>
                <div className="stat-label">Podcast Episodes</div>
              </div>

              <div className="stat-card">
                <div className="stat-number">{summary.teamMembers}</div>
                <div className="stat-label">Team Members</div>
              </div>

              <div className="stat-card">
                <div className="stat-number">{summary.mediaFiles}</div>
                <div className="stat-label">Media Files</div>
              </div>
            </div>

            <div className="dashboard-help">
              <h2>Admin Dashboard</h2>
              <div className="help-grid">
                <div className="help-card">
                  <h4>Content Management</h4>
                  <p>This dashboard shows your current content. Future updates will add editing capabilities.</p>
                </div>
                <div className="help-card">
                  <h4>Current Data</h4>
                  <p>Content is loaded from your existing /data/*.json files and About page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="admin-footer">
        <p>Surus Admin - Content Management System</p>
      </footer>
    </div>
  );
}
