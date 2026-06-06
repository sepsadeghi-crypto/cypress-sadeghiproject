import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

export default function AdminUserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'user', enabled: true, phone: '', dob: '', street: '', house_number: '', city: '', state: '', country: '', postal_code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      client.get(`/users/${id}`).then(r => {
        const u = r.data;
        setForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, password: '', role: u.role, enabled: u.enabled, phone: u.phone || '', dob: u.dob || '', street: u.street || '', house_number: u.house_number || '', city: u.city || '', state: u.state || '', country: u.country || '', postal_code: u.postal_code || '' });
      }).catch(() => navigate('/admin/users'));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (isEdit) await client.put(`/users/${id}`, payload);
      else await client.post('/users', payload);
      navigate('/admin/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit User' : 'Add User'}>
      <div className="max-w-xl" data-id="page-user-form">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700" data-id="form-error">{error}</div>}
        <form onSubmit={handleSubmit} className="card p-5 space-y-4" data-id="user-form">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input className="input-field" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required data-testid="first-name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input className="input-field" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required data-testid="last-name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required data-testid="email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input type="password" className="input-field" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!isEdit} minLength={isEdit ? 0 : 8} data-testid="password" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})} data-testid="role">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.enabled} onChange={e => setForm({...form, enabled: e.target.checked})} className="rounded text-primary-600" data-testid="enabled" />
                <span className="text-sm text-gray-700">Account Enabled</span>
              </label>
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input className="input-field" value={form.city} onChange={e => setForm({...form, city: e.target.value})} data-testid="city" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input className="input-field" value={form.country} onChange={e => setForm({...form, country: e.target.value})} data-testid="country" />
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/users" className="btn-secondary" data-id="btn-cancel">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary" data-id="btn-submit-user" data-testid="submit-user">
              {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
