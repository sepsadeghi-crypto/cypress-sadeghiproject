import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/products', { params: { _page: page, _limit: 10, q: search || undefined } });
      setProducts(data.data);
      setTotal(data.total);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    setDeleting(id);
    try {
      await client.delete(`/products/${id}`);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
    setDeleting(null);
  };

  return (
    <AdminLayout title="Products">
      <div className="flex items-center justify-between mb-4 gap-3">
        <input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="input-field max-w-xs" data-id="input-search-products" data-testid="search-products" />
        <Link to="/admin/products/add" className="btn-primary text-sm whitespace-nowrap" data-id="btn-add-product" data-testid="add-product">+ Add Product</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" data-id="products-table" data-testid="products-table">
            <thead className="bg-gray-50">
              <tr>
                {['Image', 'Name', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500" data-id="products-loading">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500" data-id="products-empty">No products found</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50" data-id="product-row" data-testid="product-row">
                  <td className="px-4 py-3">
                    <img src={p.image} alt={p.name} className="w-10 h-8 object-cover rounded" onError={(e) => { e.target.src = 'https://placehold.co/40x32/e5e7eb/6b7280?text=T'; }} data-id="product-thumbnail" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs" data-id="product-name">{p.name}</p>
                    {p.is_rental && <span className="badge-blue text-xs ml-1" data-id="badge-rental">Rental</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500" data-id="product-category">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900" data-id="product-price">${p.price?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={p.stock > 5 ? 'badge-green' : p.stock > 0 ? 'badge-yellow' : 'badge-red'} data-id="product-stock">{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/admin/products/edit/${p.id}`} className="text-xs text-blue-600 hover:text-blue-700 font-medium" data-id="btn-edit-product" data-testid="edit-product">Edit</Link>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="text-xs text-red-600 hover:text-red-700 font-medium" data-id="btn-delete-product" data-testid="delete-product">
                        {deleting === p.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 10 && (
          <div className="px-4 py-3 flex items-center justify-between border-t text-sm text-gray-500" data-id="products-pagination">
            <span data-id="products-count">Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1 px-2 text-xs" data-id="btn-prev-page">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= total} className="btn-secondary py-1 px-2 text-xs" data-id="btn-next-page">Next</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
