import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';

const STATUS_BADGE = {
  AWAITING_FULFILLMENT: 'badge-yellow',
  ON_HOLD: 'badge-gray',
  AWAITING_SHIPMENT: 'badge-blue',
  SHIPPED: 'badge-blue',
  COMPLETED: 'badge-green',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/invoices/${id}`)
      .then(r => setOrder(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">Loading...</div>;
  if (!order) return <div className="max-w-3xl mx-auto px-4 py-8 text-center"><p className="text-gray-500">Order not found.</p><Link to="/account/orders" className="btn-primary mt-4 inline-block">Back to Orders</Link></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order {order.invoice_number}</h1>
        <Link to="/account/orders" className="btn-secondary text-sm">← Back</Link>
      </div>

      <div className="space-y-6">
        <div className="card p-5">
          <div className="flex flex-wrap gap-4 justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order Date</p>
              <p className="text-sm font-medium">{new Date(order.invoice_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
              <span className={STATUS_BADGE[order.status] || 'badge-gray'} data-testid="order-status">{order.status?.replace(/_/g, ' ')}</span>
              {order.status_message && <p className="text-xs text-gray-500 mt-1">{order.status_message}</p>}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment</p>
              <p className="text-sm font-medium capitalize">{order.payment_method?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total</p>
              <p className="text-lg font-bold text-primary-600">${order.total?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Items</h2>
          </div>
          <table className="w-full">
            <tbody className="divide-y divide-gray-100">
              {(order.items || []).map(item => (
                <tr key={item.id} data-testid="order-item">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {item.product && (
                        <img src={item.product.image} alt={item.product.name} className="w-12 h-9 object-cover rounded" onError={(e) => { e.target.src = 'https://placehold.co/48x36/e5e7eb/6b7280?text=T'; }} />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                        {item.discount_percentage > 0 && <p className="text-xs text-green-600">{item.discount_percentage}% discount</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 text-center">×{item.quantity}</td>
                  <td className="px-5 py-3 text-sm text-gray-500 text-center">${item.unit_price?.toFixed(2)} each</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">${item.line_total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-200 bg-gray-50">
              <tr>
                <td colSpan={3} className="px-5 py-3 text-sm font-bold text-gray-900 text-right">Total</td>
                <td className="px-5 py-3 text-sm font-bold text-primary-600 text-right">${order.total?.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Billing Address</h2>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p>{order.billing_first_name} {order.billing_last_name}</p>
            <p>{order.billing_email}</p>
            <p>{order.billing_address}</p>
            <p>{order.billing_city}{order.billing_state ? `, ${order.billing_state}` : ''} {order.billing_postal_code}</p>
            <p>{order.billing_country}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
