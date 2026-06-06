import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import client from '../../api/client';

function BarChart({ data, xKey, yKey, label, color = 'bg-primary-500' }) {
  if (!data?.length) return <p className="text-sm text-gray-400 text-center py-4">No data</p>;
  const max = Math.max(...data.map(d => d[yKey] || 0));
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-24 text-xs text-gray-600 text-right flex-shrink-0">{item[xKey]}</div>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${max > 0 ? (item[yKey] / max) * 100 : 0}%` }} />
          </div>
          <div className="w-20 text-xs text-gray-700 flex-shrink-0">{typeof item[yKey] === 'number' ? (yKey === 'count' ? item[yKey] : `$${item[yKey].toFixed(2)}`) : item[yKey]}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminReports() {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    Promise.all([
      client.get('/reports/total-sales-of-years'),
      client.get('/reports/total-sales-per-country'),
      client.get('/reports/top10-purchased-products'),
      client.get('/reports/top10-best-selling-categories'),
      client.get('/reports/customers-by-country'),
      client.get('/reports/average-sales-per-month'),
      client.get('/reports/average-sales-per-week'),
    ]).then(([years, countries, products, categories, customers, monthly, weekly]) => {
      setReports({ years: years.data, countries: countries.data, products: products.data, categories: categories.data, customers: customers.data, monthly: monthly.data, weekly: weekly.data });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'sales', label: 'Sales Overview' },
    { id: 'products', label: 'Top Products' },
    { id: 'customers', label: 'Customers' },
  ];

  if (loading) return <AdminLayout title="Reports"><div className="text-center py-8 text-gray-500">Loading reports...</div></AdminLayout>;

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="flex gap-2 mb-6 border-b" data-id="reports-tabs">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            data-testid={`tab-${t.id}`}
          >{t.label}</button>
        ))}
      </div>

      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Total Sales by Year</h3>
            <BarChart data={reports.years} xKey="year" yKey="total" color="bg-primary-500" />
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Sales by Country</h3>
            <BarChart data={reports.countries} xKey="country" yKey="total" color="bg-blue-500" />
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Average Sales per Month</h3>
            <BarChart data={reports.monthly} xKey="month" yKey="total" color="bg-green-500" />
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Average Sales per Day of Week</h3>
            <BarChart data={reports.weekly} xKey="day" yKey="total" color="bg-purple-500" />
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Top 10 Purchased Products</h3>
            <BarChart data={reports.products} xKey="name" yKey="quantity" color="bg-primary-500" />
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Top 10 Best-Selling Categories</h3>
            <BarChart data={reports.categories} xKey="name" yKey="revenue" color="bg-amber-500" />
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Customers by Country</h3>
            <BarChart data={reports.customers} xKey="country" yKey="count" color="bg-teal-500" />
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Sales (All Years)', value: `$${(reports.years || []).reduce((s, y) => s + y.total, 0).toFixed(2)}` },
                { label: 'Total Orders', value: (reports.monthly || []).reduce((s, m) => s + m.count, 0) },
                { label: 'Countries with Sales', value: (reports.countries || []).length },
                { label: 'Products Sold', value: (reports.products || []).reduce((s, p) => s + p.quantity, 0) },
              ].map(stat => (
                <div key={stat.label} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
