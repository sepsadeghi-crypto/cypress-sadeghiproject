import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/users', { params: { _page: page, _limit: 10, q: search || undefined } });
      setUsers(data.data);
      setTotal(data.total);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [page, search]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await client.delete(`/users/${id}`); fetch(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleToggleEnabled = async (user) => {
    await client.patch(`/users/${user.id}`, { enabled: !user.enabled });
    fetch();
  };

  return (
    <AdminLayout title="Users">
      <div className="flex items-center justify-between mb-4 gap-3" data-id="users-toolbar">
        <input placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input-field max-w-xs text-sm" data-id="input-search-users" data-testid="search-users" />
        <Link to="/admin/users/add" className="btn-primary text-sm" data-id="btn-add-user" data-testid="add-user">+ Add User</Link>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" data-id="users-table" data-testid="users-table">
            <thead className="bg-gray-50">
              <tr>{['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500" data-id="users-loading">Loading...</td></tr> :
                users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50" data-id="user-row" data-testid="user-row">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900" data-id="user-name">{u.first_name} {u.last_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500" data-id="user-email">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={u.role === 'admin' ? 'badge bg-purple-100 text-purple-800' : 'badge-blue'} data-id="user-role">{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleEnabled(u)} className={`text-xs font-medium px-2 py-0.5 rounded ${u.enabled ? 'text-green-700 bg-green-100 hover:bg-green-200' : 'text-red-700 bg-red-100 hover:bg-red-200'}`} data-id="btn-toggle-user-status">
                        {u.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <Link to={`/admin/users/edit/${u.id}`} className="text-xs text-blue-600 font-medium" data-id="btn-edit-user" data-testid="edit-user">Edit</Link>
                      <button onClick={() => handleDelete(u.id)} className="text-xs text-red-600 font-medium" data-id="btn-delete-user" data-testid="delete-user">Delete</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {total > 10 && (
          <div className="px-4 py-3 flex justify-between items-center border-t text-sm text-gray-500" data-id="users-pagination">
            <span data-id="users-count">{total} total users</span>
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
