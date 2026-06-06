import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

const STATUSES = ['AWAITING_FULFILLMENT', 'ON_HOLD', 'AWAITING_SHIPMENT', 'SHIPPED', 'COMPLETED'];
const STATUS_BADGE = { AWAITING_FULFILLMENT: 'badge-yellow', ON_HOLD: 'badge-gray', AWAITING_SHIPMENT: 'badge-blue', SHIPPED: 'badge-blue', COMPLETED: 'badge-green' };

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    client.get(`/invoices/${id}`).then(r => { setOrder(r.data); setNewStatus(r.data.status); setStatusMsg(r.data.status_message || ''); }).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      const { data } = await client.put(`/invoices/${id}/status`, { status: newStatus, status_message: statusMsg });
      setOrder(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <AdminLayout title="Order"><div className="text-center py-8 text-gray-500" data-id="order-loading">Loading...</div></AdminLayout>;
  if (!order) return <AdminLayout title="Order"><p className="text-gray-500" data-id="order-not-found">Order not found.</p></AdminLayout>;

  return (
    <AdminLayout title={`Order ${order.invoice_number}`}>
      <div className="flex items-center gap-3 mb-6" data-id="order-header">
        <Link to="/admin/orders" className="btn-secondary text-sm" data-id="btn-back-to-orders">← Back</Link>
        <span className={STATUS_BADGE[order.status] || 'badge-gray'} data-id="order-status-badge">{order.status?.replace(/_/g, ' ')}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden" data-id="order-items-section">
            <div className="px-5 py-3 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-900" data-id="order-items-title">Order Items</h2>
            </div>
            <table className="w-full" data-id="order-items-table">
              <tbody className="divide-y divide-gray-100">
                {(order.items || []).map(item => (
                  <tr key={item.id} data-id="order-item-row">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900" data-id="item-name">{item.product_name}</p>
                      {item.discount_percentage > 0 && <p className="text-xs text-green-600" data-id="item-discount">{item.discount_percentage}% off</p>}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 text-center" data-id="item-qty">×{item.quantity}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 text-center" data-id="item-unit-price">${item.unit_price?.toFixed(2)}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-right" data-id="item-total">${item.line_total?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-gray-200 bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-5 py-3 text-sm font-bold text-gray-900 text-right">Total</td>
                  <td className="px-5 py-3 text-sm font-bold text-primary-600 text-right" data-id="order-grand-total">${order.total?.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="card p-5" data-id="status-update-section">
            <h2 className="font-semibold text-gray-900 mb-3" data-id="status-update-title">Update Status</h2>
            <div className="space-y-3">
              <select className="input-field" value={newStatus} onChange={e => setNewStatus(e.target.value)} data-id="select-new-status" data-testid="status-select">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
              <input className="input-field text-sm" placeholder="Status message (optional)" value={statusMsg} onChange={e => setStatusMsg(e.target.value)} data-id="input-status-message" data-testid="status-message" />
              <button onClick={handleStatusUpdate} disabled={updating} className="btn-primary text-sm" data-id="btn-update-status" data-testid="update-status">
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5" data-id="customer-section">
            <h2 className="font-semibold text-gray-900 mb-3" data-id="customer-title">Customer</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900" data-id="customer-name">{order.billing_first_name} {order.billing_last_name}</p>
              <p data-id="customer-email">{order.billing_email}</p>
              <p className="mt-2 pt-2 border-t" data-id="customer-address">{order.billing_address}</p>
              <p data-id="customer-city">{order.billing_city}{order.billing_state ? `, ${order.billing_state}` : ''}</p>
              <p data-id="customer-postal">{order.billing_postal_code} {order.billing_country}</p>
            </div>
          </div>
          <div className="card p-5" data-id="payment-section">
            <h2 className="font-semibold text-gray-900 mb-3" data-id="payment-title">Payment</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="capitalize font-medium" data-id="payment-method">{order.payment_method?.replace(/_/g, ' ')}</p>
              {order.payment_details && Object.entries(order.payment_details).map(([k, v]) => (
                <p key={k} data-id={`payment-detail-${k}`}><span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}:</span> {v}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
