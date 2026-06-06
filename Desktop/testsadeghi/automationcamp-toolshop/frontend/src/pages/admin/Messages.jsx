import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

const STATUS_BADGE = { NEW: 'badge-yellow', IN_PROGRESS: 'badge-blue', RESOLVED: 'badge-green' };

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/messages', { params: { _page: page, _limit: 10, status: statusFilter || undefined } });
      setMessages(data.data);
      setTotal(data.total);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [page, statusFilter]);

  return (
    <AdminLayout title="Messages">
      <div className="flex items-center gap-3 mb-4" data-id="messages-filters">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto text-sm" data-id="select-status-filter" data-testid="status-filter">
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200" data-id="messages-table" data-testid="messages-table">
          <thead className="bg-gray-50">
            <tr>{['From', 'Subject', 'Date', 'Status', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500" data-id="messages-loading">Loading...</td></tr> :
              messages.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500" data-id="messages-empty">No messages</td></tr> :
              messages.map(m => (
                <tr key={m.id} className="hover:bg-gray-50" data-id="message-row" data-testid="message-row">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900" data-id="message-sender-name">{m.name}</p>
                    <p className="text-xs text-gray-500" data-id="message-sender-email">{m.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" data-id="message-subject">{m.subject}</td>
                  <td className="px-4 py-3 text-sm text-gray-500" data-id="message-date">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className={STATUS_BADGE[m.status] || 'badge-gray'} data-id="message-status">{m.status?.replace(/_/g, ' ')}</span></td>
                  <td className="px-4 py-3"><Link to={`/admin/messages/${m.id}`} className="text-xs text-blue-600 font-medium" data-id="btn-view-message" data-testid="view-message">View</Link></td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {total > 10 && (
          <div className="px-4 py-3 flex justify-between border-t text-sm text-gray-500" data-id="messages-pagination">
            <span data-id="messages-count">{total} messages</span>
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
