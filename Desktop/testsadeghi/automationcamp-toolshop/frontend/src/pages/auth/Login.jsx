import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 423) setError('Account is locked due to too many failed login attempts.');
      else if (status === 403) setError('Your account has been disabled.');
      else setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12" data-id="page-login">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-id="login-title">Sign In</h1>
          <p className="mt-2 text-gray-500">Welcome back to Toolshop</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700" data-id="login-error" data-testid="login-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-id="login-form">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" data-id="label-email">Email address</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="you@example.com"
                required
                autoComplete="email"
                data-id="input-email"
                data-testid="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700" data-id="label-password">Password</label>
                <Link to="/auth/forgot-password" className="text-xs text-primary-600 hover:text-primary-700" data-id="link-forgot-password">Forgot password?</Link>
              </div>
              <input
                type="password"
                className="input-field"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                data-id="input-password"
                data-testid="password"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5" data-id="btn-login" data-testid="login-submit">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium" data-id="link-register" data-testid="register-link">
              Register here
            </Link>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-500" data-id="test-credentials">
            <p className="font-medium text-gray-600 mb-1">Test Credentials:</p>
            <p>Admin: admin@automationcamp.org / welcome01</p>
            <p>Customer: customer@automationcamp.org / welcome01</p>
          </div>
        </div>
      </div>
    </div>
  );
}
