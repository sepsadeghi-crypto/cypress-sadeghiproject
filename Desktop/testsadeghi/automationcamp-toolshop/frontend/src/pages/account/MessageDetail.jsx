import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';

const STATUS_BADGE = { NEW: 'badge-yellow', IN_PROGRESS: 'badge-blue', RESOLVED: 'badge-green' };

export default function MessageDetail() {
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/messages/${id}`)
      .then(r => setMessage(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">Loading...</div>;
  if (!message) return <div className="max-w-3xl mx-auto px-4 py-8 text-center"><p className="text-gray-500">Message not found.</p><Link to="/account/messages" className="btn-primary mt-4 inline-block">Back</Link></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Message</h1>
        <Link to="/account/messages" className="btn-secondary text-sm">← Back</Link>
      </div>
      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{message.subject}</h2>
            <p className="text-sm text-gray-500">{new Date(message.created_at).toLocaleString()}</p>
          </div>
          <span className={STATUS_BADGE[message.status] || 'badge-gray'}>{message.status?.replace(/_/g, ' ')}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">{message.message}</div>
      </div>
      {message.replies?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Replies from support:</h3>
          {message.replies.map(reply => (
            <div key={reply.id} className="card p-4 bg-blue-50 border-blue-200">
              <p className="text-xs text-gray-500 mb-2">{new Date(reply.created_at).toLocaleString()} — Support Team</p>
              <p className="text-sm text-gray-700">{reply.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
