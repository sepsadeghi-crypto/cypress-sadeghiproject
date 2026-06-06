import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

const STATUS_BADGE = { AWAITING_FULFILLMENT: 'badge-yellow', ON_HOLD: 'badge-gray', AWAITING_SHIPMENT: 'badge-blue', SHIPPED: 'badge-blue', COMPLETED: 'badge-green' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/invoices', { params: { _page: page, _limit: 10, q: search || undefined } });
      let orders = data.data;
      if (statusFilter) orders = orders.filter(o => o.status === statusFilter);
      setOrders(orders);
      setTotal(data.total);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [page, search, statusFilter]);

  return (
    <AdminLayout title="Orders">
      <div className="flex items-center gap-3 mb-4 flex-wrap" data-id="orders-filters">
        <input placeholder="Search by invoice # or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input-field max-w-xs text-sm" data-id="input-search-orders" data-testid="search-orders" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto text-sm" data-id="select-status-filter" data-testid="status-filter">
          <option value="">All Statuses</option>
          {['AWAITING_FULFILLMENT', 'ON_HOLD', 'AWAITING_SHIPMENT', 'SHIPPED', 'COMPLETED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" data-id="orders-table" data-testid="orders-table">
            <thead className="bg-gray-50">
              <tr>{['Invoice #', 'Date', 'Customer', 'Total', 'Payment', 'Status', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500" data-id="orders-loading">Loading...</td></tr> :
                orders.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500" data-id="orders-empty">No orders found</td></tr> :
                orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50" data-id="order-row" data-testid="order-row">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900" data-id="order-invoice-number">{o.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-500" data-id="order-date">{new Date(o.invoice_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700" data-id="order-customer">{o.billing_first_name} {o.billing_last_name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-primary-600" data-id="order-total">${o.total?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize" data-id="order-payment">{o.payment_method?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3"><span className={STATUS_BADGE[o.status] || 'badge-gray'} data-id="order-status">{o.status?.replace(/_/g, ' ')}</span></td>
                    <td className="px-4 py-3"><Link to={`/admin/orders/${o.id}`} className="text-xs text-blue-600 font-medium" data-id="btn-view-order" data-testid="view-order">View</Link></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {total > 10 && (
          <div className="px-4 py-3 flex justify-between items-center border-t text-sm text-gray-500" data-id="orders-pagination">
            <span data-id="orders-count">{total} total orders</span>
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
