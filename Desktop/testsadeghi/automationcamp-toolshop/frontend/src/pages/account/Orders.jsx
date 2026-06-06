import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

const STATUS_BADGE = {
  AWAITING_FULFILLMENT: 'badge-yellow',
  ON_HOLD: 'badge-gray',
  AWAITING_SHIPMENT: 'badge-blue',
  SHIPPED: 'badge-blue',
  COMPLETED: 'badge-green',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    client.get('/invoices', { params: { _page: page, _limit: 10 } })
      .then(r => { setOrders(r.data.data); setLastPage(r.data.last_page); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="page-orders">
      <h1 className="text-2xl font-bold text-gray-900 mb-6" data-id="orders-title">My Orders</h1>
      <div className="card overflow-hidden" data-id="orders-container">
        {loading ? (
          <div className="p-8 text-center text-gray-500" data-id="orders-loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center" data-id="orders-empty">
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Link to="/" className="btn-primary" data-id="btn-start-shopping">Start Shopping</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" data-id="orders-table" data-testid="orders-table">
              <thead className="bg-gray-50">
                <tr>
                  {['Order #', 'Date', 'Items', 'Total', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50" data-id="order-row" data-testid="order-row">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900" data-id="order-invoice-number" data-testid="invoice-number">{order.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-500" data-id="order-date">{new Date(order.invoice_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500" data-id="order-items-count">{order.items?.length || 0} item(s)</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary-600" data-id="order-total">${order.total?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={STATUS_BADGE[order.status] || 'badge-gray'} data-id="order-status" data-testid="order-status">
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/account/orders/${order.id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium" data-id="btn-view-order" data-testid="view-order">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lastPage > 1 && (
              <div className="px-4 py-3 flex justify-center gap-2" data-id="orders-pagination">
                {[...Array(lastPage)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 text-sm rounded ${page === i + 1 ? 'bg-primary-600 text-white' : 'border text-gray-600 hover:bg-gray-50'}`} data-id={`orders-page-${i + 1}`}>{i + 1}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
