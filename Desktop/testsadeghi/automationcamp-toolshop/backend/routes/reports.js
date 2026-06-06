const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  router.use(authenticate, requireRole('admin'));

  router.get('/total-sales-of-years', (req, res) => {
    const invoices = db.get('invoices').value();
    const byYear = {};
    invoices.forEach(inv => {
      const year = new Date(inv.invoice_date).getFullYear();
      byYear[year] = (byYear[year] || 0) + inv.total;
    });
    const data = Object.entries(byYear)
      .map(([year, total]) => ({ year: parseInt(year), total: Math.round(total * 100) / 100 }))
      .sort((a, b) => a.year - b.year);
    res.json(data);
  });

  router.get('/total-sales-per-country', (req, res) => {
    const invoices = db.get('invoices').value();
    const byCountry = {};
    invoices.forEach(inv => {
      const country = inv.billing_country || 'Unknown';
      byCountry[country] = (byCountry[country] || 0) + inv.total;
    });
    const data = Object.entries(byCountry)
      .map(([country, total]) => ({ country, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total);
    res.json(data);
  });

  router.get('/top10-purchased-products', (req, res) => {
    const invoices = db.get('invoices').value();
    const productCounts = {};
    invoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        const key = item.product_id;
        if (!productCounts[key]) {
          productCounts[key] = { product_id: key, name: item.product_name, quantity: 0, revenue: 0 };
        }
        productCounts[key].quantity += item.quantity;
        productCounts[key].revenue += item.line_total;
      });
    });
    const data = Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map(p => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));
    res.json(data);
  });

  router.get('/top10-best-selling-categories', (req, res) => {
    const invoices = db.get('invoices').value();
    const products = db.get('products').value();
    const categories = db.get('categories').value();
    const catCounts = {};

    invoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        if (product && product.category_id) {
          const cat = categories.find(c => c.id === product.category_id);
          const catName = cat ? cat.name : 'Unknown';
          if (!catCounts[product.category_id]) {
            catCounts[product.category_id] = { category_id: product.category_id, name: catName, quantity: 0, revenue: 0 };
          }
          catCounts[product.category_id].quantity += item.quantity;
          catCounts[product.category_id].revenue += item.line_total;
        }
      });
    });

    const data = Object.values(catCounts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(c => ({ ...c, revenue: Math.round(c.revenue * 100) / 100 }));
    res.json(data);
  });

  router.get('/customers-by-country', (req, res) => {
    const users = db.get('users').value().filter(u => u.role === 'user');
    const byCountry = {};
    users.forEach(u => {
      const country = u.country || 'Unknown';
      byCountry[country] = (byCountry[country] || 0) + 1;
    });
    const data = Object.entries(byCountry)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
    res.json(data);
  });

  router.get('/average-sales-per-month', (req, res) => {
    const invoices = db.get('invoices').value();
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const byMonth = Array(12).fill(null).map((_, i) => ({ month: MONTHS[i], total: 0, count: 0 }));

    invoices.forEach(inv => {
      const month = new Date(inv.invoice_date).getMonth();
      byMonth[month].total += inv.total;
      byMonth[month].count += 1;
    });

    const data = byMonth.map(m => ({
      month: m.month,
      average: m.count > 0 ? Math.round((m.total / m.count) * 100) / 100 : 0,
      total: Math.round(m.total * 100) / 100,
      count: m.count,
    }));
    res.json(data);
  });

  router.get('/average-sales-per-week', (req, res) => {
    const invoices = db.get('invoices').value();
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const byDay = Array(7).fill(null).map((_, i) => ({ day: DAYS[i], total: 0, count: 0 }));

    invoices.forEach(inv => {
      const day = new Date(inv.invoice_date).getDay();
      byDay[day].total += inv.total;
      byDay[day].count += 1;
    });

    const data = byDay.map(d => ({
      day: d.day,
      average: d.count > 0 ? Math.round((d.total / d.count) * 100) / 100 : 0,
      total: Math.round(d.total * 100) / 100,
      count: d.count,
    }));
    res.json(data);
  });

  return router;
};
