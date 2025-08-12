import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminLogin(): JSX.Element {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simple authentication - in production, use proper backend API
      if (credentials.email === 'admin@surus.io' && credentials.password === 'surus2025!') {
        // Set auth token
        localStorage.setItem('surus_admin_auth', JSON.stringify({
          user: { id: '1', email: credentials.email, role: 'admin' },
          token: 'demo-token',
          expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));

        navigate(from, { replace: true });
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-header">
          <h1>Surus Admin</h1>
          <p>Sign in to manage content</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
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
            disabled={loading}
            className="login-btn"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-help">
          <p>Demo credentials:</p>
          <p><strong>Email:</strong> admin@surus.io</p>
          <p><strong>Password:</strong> surus2025!</p>
        </div>

        <div className="login-footer">
          <a href="/">← Back to Website</a>
        </div>
      </div>
    </div>
  );
}
