import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

const STATUS_BADGE = { NEW: 'badge-yellow', IN_PROGRESS: 'badge-blue', RESOLVED: 'badge-green' };

export default function AdminMessageDetail() {
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const refresh = () => client.get(`/messages/${id}`).then(r => { setMessage(r.data); setNewStatus(r.data.status); });

  useEffect(() => { refresh().finally(() => setLoading(false)); }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await client.post(`/messages/${id}/reply`, { message: reply });
      setReply('');
      await refresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status) => {
    setNewStatus(status);
    await client.put(`/messages/${id}/status`, { status });
    await refresh();
  };

  if (loading) return <AdminLayout title="Message"><div className="text-center py-8 text-gray-500" data-id="message-loading">Loading...</div></AdminLayout>;
  if (!message) return <AdminLayout title="Message"><p data-id="message-not-found">Not found.</p></AdminLayout>;

  return (
    <AdminLayout title="Message Detail">
      <div className="flex items-center gap-3 mb-6" data-id="message-header">
        <Link to="/admin/messages" className="btn-secondary text-sm" data-id="btn-back-to-messages">← Back</Link>
        <select value={newStatus} onChange={e => handleStatusChange(e.target.value)} className="input-field w-auto text-sm" data-id="select-message-status" data-testid="status-select">
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <span className={STATUS_BADGE[message.status] || 'badge-gray'} data-id="message-status-badge">{message.status?.replace(/_/g, ' ')}</span>
      </div>

      <div className="max-w-2xl space-y-4">
        <div className="card p-5" data-id="message-original">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900" data-id="message-subject">{message.subject}</h2>
              <p className="text-sm text-gray-500">From: <span className="font-medium text-gray-700" data-id="message-sender">{message.name}</span> (<span data-id="message-email">{message.email}</span>)</p>
              <p className="text-xs text-gray-400" data-id="message-date">{new Date(message.created_at).toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap" data-id="message-body">{message.message}</div>
        </div>

        {message.replies?.length > 0 && (
          <div data-id="message-replies">
            <h3 className="font-semibold text-gray-700 mb-2" data-id="replies-title">Replies</h3>
            {message.replies.map(r => (
              <div key={r.id} className="card p-4 bg-blue-50 border-blue-200 mb-2" data-id="reply-item">
                <p className="text-xs text-gray-500 mb-1" data-id="reply-date">{new Date(r.created_at).toLocaleString()} — Admin</p>
                <p className="text-sm text-gray-700" data-id="reply-body">{r.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="card p-5" data-id="reply-form-section">
          <h3 className="font-semibold text-gray-900 mb-3" data-id="reply-form-title">Send Reply</h3>
          <form onSubmit={handleReply} className="space-y-3" data-id="reply-form">
            <textarea className="input-field" rows={4} value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." required data-id="input-reply-text" data-testid="reply-text" />
            <button type="submit" disabled={sending} className="btn-primary text-sm" data-id="btn-send-reply" data-testid="send-reply">
              {sending ? 'Sending...' : 'Send Reply'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
