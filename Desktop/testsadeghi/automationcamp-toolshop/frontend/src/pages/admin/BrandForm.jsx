import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

export default function AdminBrandForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({ name: '', slug: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) client.get(`/brands/${id}`).then(r => setForm({ name: r.data.name, slug: r.data.slug })).catch(() => navigate('/admin/brands'));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) await client.put(`/brands/${id}`, form);
      else await client.post('/brands', form);
      navigate('/admin/brands');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit Brand' : 'Add Brand'}>
      <div className="max-w-md">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
            <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required data-testid="brand-name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input className="input-field" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="auto-generated" data-testid="brand-slug" />
          </div>
          <div className="flex gap-3">
            <Link to="/admin/brands" className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary" data-testid="submit-brand">
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
