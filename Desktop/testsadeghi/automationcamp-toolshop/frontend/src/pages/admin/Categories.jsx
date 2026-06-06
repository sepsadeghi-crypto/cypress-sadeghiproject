import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => { setLoading(true); client.get('/categories').then(r => setCategories(r.data)).finally(() => setLoading(false)); };
  useEffect(fetch, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await client.delete(`/categories/${id}`); fetch(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const topLevel = categories.filter(c => !c.parent_id);
  const getChildren = (parentId) => categories.filter(c => c.parent_id === parentId);

  return (
    <AdminLayout title="Categories">
      <div className="flex justify-end mb-4">
        <Link to="/admin/categories/add" className="btn-primary text-sm" data-testid="add-category">+ Add Category</Link>
      </div>
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200" data-testid="categories-table">
          <thead className="bg-gray-50">
            <tr>{['Name', 'Slug', 'Parent', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr> :
              topLevel.map(cat => (
                <>
                  <tr key={cat.id} className="hover:bg-gray-50 bg-white" data-testid="category-row">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{cat.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cat.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">—</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Link to={`/admin/categories/edit/${cat.id}`} className="text-xs text-blue-600 font-medium">Edit</Link>
                      <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-600 font-medium">Delete</button>
                    </td>
                  </tr>
                  {getChildren(cat.id).map(child => (
                    <tr key={child.id} className="hover:bg-gray-50 bg-gray-50/30" data-testid="category-row">
                      <td className="px-4 py-3 text-sm text-gray-700 pl-10">↳ {child.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{child.slug}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{cat.name}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <Link to={`/admin/categories/edit/${child.id}`} className="text-xs text-blue-600 font-medium">Edit</Link>
                        <button onClick={() => handleDelete(child.id)} className="text-xs text-red-600 font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </>
              ))
            }
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
