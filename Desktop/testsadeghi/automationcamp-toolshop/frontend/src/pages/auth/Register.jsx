import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', password_confirm: '', phone: '', dob: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/account/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12" data-id="page-register">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-id="register-title">Create Account</h1>
          <p className="mt-2 text-gray-500">Join Toolshop today</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700" data-id="register-error" data-testid="register-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-id="register-form">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input className="input-field" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required data-id="input-first-name" data-testid="first-name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input className="input-field" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required data-id="input-last-name" data-testid="last-name" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address *</label>
              <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required autoComplete="email" data-id="input-email" data-testid="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password * (min 8 chars)</label>
              <input type="password" className="input-field" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={8} autoComplete="new-password" data-id="input-password" data-testid="password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input type="password" className="input-field" value={form.password_confirm} onChange={e => setForm({...form, password_confirm: e.target.value})} required data-id="input-password-confirm" data-testid="password-confirm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} data-id="input-phone" data-testid="phone" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" className="input-field" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} data-id="input-dob" data-testid="dob" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5" data-id="btn-register" data-testid="register-submit">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium" data-id="link-login" data-testid="login-link">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
