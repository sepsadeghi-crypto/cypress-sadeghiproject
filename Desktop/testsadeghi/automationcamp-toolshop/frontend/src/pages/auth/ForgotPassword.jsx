import { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await client.post('/users/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="mt-2 text-gray-500">Enter your email to receive a reset link</p>
        </div>
        <div className="card p-8">
          {submitted ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-4">If this email exists, a reset link has been sent.</p>
              <Link to="/auth/login" className="btn-primary">Back to Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required data-testid="email" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full" data-testid="submit">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <div className="mt-4 text-center text-sm text-gray-500">
                <Link to="/auth/login" className="text-primary-600 hover:text-primary-700">Back to Sign In</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
