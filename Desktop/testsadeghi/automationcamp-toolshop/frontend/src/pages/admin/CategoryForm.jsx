import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

export default function AdminCategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({ name: '', slug: '', parent_id: '' });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/categories').then(r => setCategories(r.data.filter(c => !id || c.id !== id))).catch(() => {});
    if (isEdit) client.get(`/categories/${id}`).then(r => setForm({ name: r.data.name, slug: r.data.slug, parent_id: r.data.parent_id || '' })).catch(() => navigate('/admin/categories'));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, parent_id: form.parent_id || null };
      if (isEdit) await client.put(`/categories/${id}`, payload);
      else await client.post('/categories', payload);
      navigate('/admin/categories');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit Category' : 'Add Category'}>
      <div className="max-w-md">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required data-testid="category-name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input className="input-field" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="auto-generated if empty" data-testid="category-slug" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
            <select className="input-field" value={form.parent_id} onChange={e => setForm({...form, parent_id: e.target.value})} data-testid="parent-category">
              <option value="">None (top level)</option>
              {categories.filter(c => !c.parent_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/categories" className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary" data-testid="submit-category">
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
