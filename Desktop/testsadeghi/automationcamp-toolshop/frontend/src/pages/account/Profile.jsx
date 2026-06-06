import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

function AccountNav() {
  const links = [
    { to: '/account/profile', label: 'My Profile' },
    { to: '/account/orders', label: 'My Orders' },
    { to: '/account/favorites', label: 'Favorites' },
    { to: '/account/messages', label: 'Messages' },
  ];
  return (
    <nav className="card p-2 mb-6 md:mb-0 md:w-48 flex-shrink-0">
      {links.map(l => (
        <a key={l.to} href={l.to} className="block px-4 py-2.5 text-sm rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">{l.label}</a>
      ))}
    </nav>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    street: user?.street || '',
    house_number: user?.house_number || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || '',
    postal_code: user?.postal_code || '',
  });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await client.put(`/users/${user.id}`, form);
      updateUser({ ...user, ...data });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('New passwords do not match.');
      return;
    }
    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    try {
      await client.post('/users/change-password', { current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwSuccess('Password changed successfully!');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="page-profile">
      <h1 className="text-2xl font-bold text-gray-900 mb-6" data-id="profile-title">My Account</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <AccountNav />
        <div className="flex-1 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">{success}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input className="input-field" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} data-testid="first-name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input className="input-field" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} data-testid="last-name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} data-testid="email" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} data-testid="phone" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" className="input-field" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} data-testid="dob" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                  <input className="input-field" value={form.street} onChange={e => setForm({...form, street: e.target.value})} data-testid="street" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House No.</label>
                  <input className="input-field" value={form.house_number} onChange={e => setForm({...form, house_number: e.target.value})} data-testid="house-number" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input className="input-field" value={form.city} onChange={e => setForm({...form, city: e.target.value})} data-testid="city" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input className="input-field" value={form.state} onChange={e => setForm({...form, state: e.target.value})} data-testid="state" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input className="input-field" value={form.country} onChange={e => setForm({...form, country: e.target.value})} data-testid="country" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input className="input-field" value={form.postal_code} onChange={e => setForm({...form, postal_code: e.target.value})} data-testid="postal-code" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary" data-id="btn-save-profile" data-testid="update-profile">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            {pwSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">{pwSuccess}</div>}
            {pwError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{pwError}</div>}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" className="input-field" value={pwForm.current_password} onChange={e => setPwForm({...pwForm, current_password: e.target.value})} required data-testid="current-password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" className="input-field" value={pwForm.new_password} onChange={e => setPwForm({...pwForm, new_password: e.target.value})} required minLength={8} data-testid="new-password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" className="input-field" value={pwForm.confirm_password} onChange={e => setPwForm({...pwForm, confirm_password: e.target.value})} required data-testid="confirm-password" />
              </div>
              <button type="submit" disabled={pwLoading} className="btn-primary" data-id="btn-change-password" data-testid="change-password">
                {pwLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
