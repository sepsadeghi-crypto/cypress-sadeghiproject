import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

function StatCard({ label, value, icon, to, color }) {
  return (
    <Link to={to} className="card p-5 hover:shadow-md transition-shadow block" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/products', { params: { _limit: 1 } }),
      client.get('/users', { params: { _limit: 1 } }),
      client.get('/invoices', { params: { _limit: 5 } }),
      client.get('/messages', { params: { _limit: 1 } }),
    ]).then(([products, users, invoices, messages]) => {
      setStats({
        products: products.data.total,
        users: users.data.total,
        orders: invoices.data.total,
        messages: messages.data.total,
        revenue: invoices.data.data.reduce((s, i) => s, 0),
      });
      setRecentOrders(invoices.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusColors = { AWAITING_FULFILLMENT: 'badge-yellow', ON_HOLD: 'badge-gray', AWAITING_SHIPMENT: 'badge-blue', SHIPPED: 'badge-blue', COMPLETED: 'badge-green' };

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-id="stats-grid">
        <StatCard label="Products" value={stats.products} to="/admin/products" color="bg-blue-500" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        <StatCard label="Orders" value={stats.orders} to="/admin/orders" color="bg-primary-500" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <StatCard label="Users" value={stats.users} to="/admin/users" color="bg-green-500" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        <StatCard label="Messages" value={stats.messages} to="/admin/messages" color="bg-purple-500" icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-id="dashboard-panels">
        <div className="card">
          <div className="px-5 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary-600">View all →</Link>
          </div>
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map(order => (
                <Link key={order.id} to={`/admin/orders/${order.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors" data-id="recent-order-row" data-testid="recent-order">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.invoice_number}</p>
                    <p className="text-xs text-gray-500">{order.billing_first_name} {order.billing_last_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-600">${order.total?.toFixed(2)}</p>
                    <span className={`${statusColors[order.status] || 'badge-gray'} mt-1`}>{order.status?.replace(/_/g, ' ')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { to: '/admin/products/add', label: 'Add Product', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
              { to: '/admin/categories/add', label: 'Add Category', color: 'text-green-600 bg-green-50 hover:bg-green-100' },
              { to: '/admin/brands/add', label: 'Add Brand', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
              { to: '/admin/users/add', label: 'Add User', color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
              { to: '/admin/messages', label: 'View Messages', color: 'text-red-600 bg-red-50 hover:bg-red-100' },
              { to: '/admin/reports', label: 'View Reports', color: 'text-gray-600 bg-gray-50 hover:bg-gray-100' },
            ].map(a => (
              <Link key={a.to} to={a.to} className={`p-3 rounded-lg text-sm font-medium transition-colors text-center ${a.color}`}>{a.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
