import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user ? `${user.first_name} ${user.last_name}` : '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await client.post('/messages', form);
      setSuccess(true);
      setForm({ name: user ? `${user.first_name} ${user.last_name}` : '', email: user?.email || '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-id="page-contact">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900" data-id="contact-title">Contact Us</h1>
        <p className="mt-2 text-gray-500">Have a question or feedback? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4" data-id="contact-info">
          <div className="card p-4" data-id="contact-email-card">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500" data-id="contact-email-address">support@toolshop.com</p>
              </div>
            </div>
          </div>
          <div className="card p-4" data-id="contact-hours-card">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Support Hours</p>
                <p className="text-sm text-gray-500" data-id="contact-hours">Mon–Fri, 9am–5pm EST</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2" data-id="contact-form-container">
          {success ? (
            <div className="card p-8 text-center" data-id="contact-success">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2" data-id="contact-success-title">Message Sent!</h3>
              <p className="text-gray-500 text-sm mb-4">Thank you for your message. We'll get back to you within 24–48 hours.</p>
              <button onClick={() => setSuccess(false)} className="btn-secondary" data-id="btn-send-another">Send Another Message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-6" data-id="contact-form">
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700" data-id="contact-error" data-testid="form-error">{error}</div>}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required data-id="input-contact-name" data-testid="contact-name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required data-id="input-contact-email" data-testid="contact-email" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input className="input-field" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required data-id="input-contact-subject" data-testid="contact-subject" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea className="input-field" rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required data-id="input-contact-message" data-testid="contact-message" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full" data-id="btn-contact-submit" data-testid="contact-submit">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
