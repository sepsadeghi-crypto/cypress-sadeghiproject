import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

const STATUS_BADGE = { NEW: 'badge-yellow', IN_PROGRESS: 'badge-blue', RESOLVED: 'badge-green' };

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/messages')
      .then(r => setMessages(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="page-messages">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900" data-id="messages-title">My Messages</h1>
        <Link to="/contact" className="btn-primary text-sm" data-id="btn-new-message">New Message</Link>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No messages yet.</p>
            <Link to="/contact" className="btn-primary">Contact Support</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map(msg => (
              <Link key={msg.id} to={`/account/messages/${msg.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors" data-id="message-row" data-testid="message-row">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate" data-id="message-subject">{msg.subject}</p>
                  <p className="text-sm text-gray-500 truncate" data-id="message-preview">{msg.message.substring(0, 80)}...</p>
                  <p className="text-xs text-gray-400 mt-1" data-id="message-date">{new Date(msg.created_at).toLocaleDateString()}</p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  {msg.replies?.length > 0 && <span className="text-xs text-gray-500" data-id="message-reply-count">{msg.replies.length} {msg.replies.length === 1 ? 'reply' : 'replies'}</span>}
                  <span className={STATUS_BADGE[msg.status] || 'badge-gray'} data-id="message-status">{msg.status?.replace(/_/g, ' ')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
