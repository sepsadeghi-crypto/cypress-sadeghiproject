import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => { setLoading(true); client.get('/brands').then(r => setBrands(r.data)).finally(() => setLoading(false)); };
  useEffect(fetch, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this brand?')) return;
    try { await client.delete(`/brands/${id}`); fetch(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  return (
    <AdminLayout title="Brands">
      <div className="flex justify-end mb-4">
        <Link to="/admin/brands/add" className="btn-primary text-sm" data-testid="add-brand">+ Add Brand</Link>
      </div>
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200" data-testid="brands-table">
          <thead className="bg-gray-50">
            <tr>{['Name', 'Slug', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr> :
              brands.map(b => (
                <tr key={b.id} className="hover:bg-gray-50" data-testid="brand-row">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{b.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.slug}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link to={`/admin/brands/edit/${b.id}`} className="text-xs text-blue-600 font-medium">Edit</Link>
                    <button onClick={() => handleDelete(b.id)} className="text-xs text-red-600 font-medium">Delete</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
