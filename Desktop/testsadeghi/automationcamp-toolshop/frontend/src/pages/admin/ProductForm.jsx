import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', brand_id: '', category_id: '', co2_rating: 'C', is_rental: false, is_location_offer: false, image: '', specs: [] });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/brands').then(r => setBrands(r.data)).catch(() => {});
    client.get('/categories').then(r => setCategories(r.data)).catch(() => {});
    if (isEdit) {
      client.get(`/products/${id}`).then(r => {
        const p = r.data;
        setForm({ name: p.name, description: p.description || '', price: String(p.price), stock: String(p.stock), brand_id: p.brand_id || '', category_id: p.category_id || '', co2_rating: p.co2_rating || 'C', is_rental: p.is_rental || false, is_location_offer: p.is_location_offer || false, image: p.image || '', specs: p.specs || [] });
      }).catch(() => navigate('/admin/products'));
    }
  }, [id]);

  const addSpec = () => setForm(f => ({ ...f, specs: [...f.specs, { name: '', value: '', unit: '' }] }));
  const updateSpec = (i, key, val) => setForm(f => ({ ...f, specs: f.specs.map((s, idx) => idx === i ? { ...s, [key]: val } : s) }));
  const removeSpec = (i) => setForm(f => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
      if (isEdit) {
        await client.put(`/products/${id}`, payload);
      } else {
        await client.post('/products', payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit Product' : 'Add Product'}>
      <div className="max-w-2xl" data-id="page-product-form">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700" data-id="form-error">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4" data-id="product-form">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Info</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required data-testid="product-name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input-field" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} data-testid="product-description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <input type="number" step="0.01" min="0" className="input-field" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required data-testid="product-price" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                <input type="number" min="0" className="input-field" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required data-testid="product-stock" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="input-field" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} data-testid="product-category">
                  <option value="">-- Select --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select className="input-field" value={form.brand_id} onChange={e => setForm({...form, brand_id: e.target.value})} data-testid="product-brand">
                  <option value="">-- Select --</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CO₂ Rating</label>
                <select className="input-field" value={form.co2_rating} onChange={e => setForm({...form, co2_rating: e.target.value})} data-testid="product-co2">
                  {['A','B','C','D','E','F','G'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input className="input-field" value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://..." data-testid="product-image" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_rental} onChange={e => setForm({...form, is_rental: e.target.checked})} className="rounded text-primary-600" data-testid="product-rental" />
                <span className="text-sm text-gray-700">Available for Rental</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_location_offer} onChange={e => setForm({...form, is_location_offer: e.target.checked})} className="rounded text-primary-600" />
                <span className="text-sm text-gray-700">Location Offer</span>
              </label>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Specifications</h2>
              <button type="button" onClick={addSpec} className="btn-secondary text-xs py-1" data-testid="add-spec">+ Add Spec</button>
            </div>
            {form.specs.map((spec, i) => (
              <div key={i} className="flex gap-2 mb-2" data-testid="spec-row">
                <input placeholder="Name" className="input-field flex-1 text-sm" value={spec.name} onChange={e => updateSpec(i, 'name', e.target.value)} />
                <input placeholder="Value" className="input-field flex-1 text-sm" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} />
                <input placeholder="Unit" className="input-field w-20 text-sm" value={spec.unit} onChange={e => updateSpec(i, 'unit', e.target.value)} />
                <button type="button" onClick={() => removeSpec(i)} className="text-red-500 hover:text-red-700 px-1">✕</button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link to="/admin/products" className="btn-secondary" data-id="btn-cancel">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary" data-id="btn-submit-product" data-testid="submit-product">
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
