const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  const STATUSES = ['AWAITING_FULFILLMENT', 'ON_HOLD', 'AWAITING_SHIPMENT', 'SHIPPED', 'COMPLETED'];

  function enrichInvoice(invoice, db) {
    if (!invoice) return null;
    const items = (invoice.items || []).map(item => {
      const product = db.get('products').find({ id: item.product_id }).value();
      return { ...item, product: product || null };
    });
    return { ...invoice, items };
  }

  function generateInvoiceNumber(db) {
    const year = new Date().getFullYear();
    const invoices = db.get('invoices').value();
    const count = invoices.filter(i => i.invoice_number && i.invoice_number.includes(String(year))).length + 1;
    return `INV-${year}-${String(count).padStart(4, '0')}`;
  }

  function createInvoiceFromCart(body, userId, db) {
    const {
      cart_id, billing_first_name, billing_last_name, billing_email,
      billing_address, billing_city, billing_state, billing_country, billing_postal_code,
      payment_method, payment_details = {},
    } = body;

    let items = [];
    if (cart_id) {
      const cart = db.get('carts').find({ id: cart_id }).value();
      if (cart && cart.items) {
        items = cart.items.map(item => {
          const product = db.get('products').find({ id: item.product_id }).value();
          const unit_price = product ? product.price : item.unit_price || 0;
          const discounted = unit_price * (1 - (item.discount_percentage || 0) / 100);
          return {
            id: `invitem-${uuidv4()}`,
            product_id: item.product_id,
            product_name: product ? product.name : 'Unknown Product',
            unit_price,
            quantity: item.quantity,
            discount_percentage: item.discount_percentage || 0,
            line_total: Math.round(discounted * item.quantity * 100) / 100,
          };
        });
        db.get('carts').remove({ id: cart_id }).write();
      }
    } else if (body.items) {
      items = body.items.map(item => {
        const product = db.get('products').find({ id: item.product_id }).value();
        const unit_price = product ? product.price : item.unit_price || 0;
        return {
          id: `invitem-${uuidv4()}`,
          product_id: item.product_id,
          product_name: product ? product.name : 'Unknown Product',
          unit_price,
          quantity: item.quantity,
          discount_percentage: item.discount_percentage || 0,
          line_total: Math.round(unit_price * item.quantity * 100) / 100,
        };
      });
    }

    const subtotal = items.reduce((sum, i) => sum + i.line_total, 0);

    return {
      id: `inv-${uuidv4()}`,
      user_id: userId,
      invoice_number: generateInvoiceNumber(db),
      invoice_date: new Date().toISOString(),
      billing_first_name: billing_first_name || '',
      billing_last_name: billing_last_name || '',
      billing_email: billing_email || '',
      billing_address: billing_address || '',
      billing_city: billing_city || '',
      billing_state: billing_state || '',
      billing_country: billing_country || '',
      billing_postal_code: billing_postal_code || '',
      payment_method: payment_method || 'credit_card',
      payment_details,
      subtotal: Math.round(subtotal * 100) / 100,
      discount_amount: 0,
      total: Math.round(subtotal * 100) / 100,
      status: 'AWAITING_FULFILLMENT',
      status_message: 'Order received and awaiting processing',
      items,
      created_at: new Date().toISOString(),
    };
  }

  router.get('/', authenticate, (req, res) => {
    const { _page = 1, _limit = 10, _sort = 'invoice_date', _order = 'desc', q } = req.query;
    let invoices = db.get('invoices').value();

    if (req.user.role !== 'admin') {
      invoices = invoices.filter(i => i.user_id === req.user.id);
    }

    if (q) {
      const query = q.toLowerCase();
      invoices = invoices.filter(i =>
        (i.invoice_number && i.invoice_number.toLowerCase().includes(query)) ||
        (i.billing_email && i.billing_email.toLowerCase().includes(query))
      );
    }

    invoices = invoices.sort((a, b) => {
      const av = a[_sort] || '';
      const bv = b[_sort] || '';
      return _order === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv);
    });

    const total = invoices.length;
    const page = parseInt(_page);
    const limit = parseInt(_limit);
    const start = (page - 1) * limit;
    const paginated = invoices.slice(start, start + limit).map(i => enrichInvoice(i, db));

    res.set('X-Total-Count', total);
    res.json({ data: paginated, total, current_page: page, per_page: limit, last_page: Math.ceil(total / limit) });
  });

  router.get('/search', authenticate, (req, res) => {
    const { q = '' } = req.query;
    const query = q.toLowerCase();
    let invoices = db.get('invoices').value();

    if (req.user.role !== 'admin') {
      invoices = invoices.filter(i => i.user_id === req.user.id);
    }

    invoices = invoices.filter(i =>
      (i.invoice_number && i.invoice_number.toLowerCase().includes(query)) ||
      (i.billing_email && i.billing_email.toLowerCase().includes(query))
    ).map(i => enrichInvoice(i, db));

    res.json({ data: invoices });
  });

  router.get('/:id', authenticate, (req, res) => {
    const invoice = db.get('invoices').find({ id: req.params.id }).value();
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (req.user.role !== 'admin' && invoice.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(enrichInvoice(invoice, db));
  });

  router.post('/', authenticate, (req, res) => {
    const invoice = createInvoiceFromCart(req.body, req.user.id, db);
    db.get('invoices').push(invoice).write();
    res.status(201).json(enrichInvoice(invoice, db));
  });

  router.post('/guest', (req, res) => {
    const invoice = createInvoiceFromCart(req.body, null, db);
    db.get('invoices').push(invoice).write();
    res.status(201).json(enrichInvoice(invoice, db));
  });

  router.put('/:id/status', authenticate, (req, res) => {
    const invoice = db.get('invoices').find({ id: req.params.id }).value();
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { status, status_message } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${STATUSES.join(', ')}` });
    }

    db.get('invoices').find({ id: req.params.id }).assign({ status, status_message: status_message || '' }).write();
    res.json(enrichInvoice(db.get('invoices').find({ id: req.params.id }).value(), db));
  });

  router.put('/:id', authenticate, (req, res) => {
    const invoice = db.get('invoices').find({ id: req.params.id }).value();
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { status, status_message, billing_first_name, billing_last_name, billing_address, billing_city, billing_state, billing_country, billing_postal_code } = req.body;
    const updates = {};
    if (status !== undefined) updates.status = status;
    if (status_message !== undefined) updates.status_message = status_message;
    if (billing_first_name !== undefined) updates.billing_first_name = billing_first_name;
    if (billing_last_name !== undefined) updates.billing_last_name = billing_last_name;
    if (billing_address !== undefined) updates.billing_address = billing_address;
    if (billing_city !== undefined) updates.billing_city = billing_city;
    if (billing_state !== undefined) updates.billing_state = billing_state;
    if (billing_country !== undefined) updates.billing_country = billing_country;
    if (billing_postal_code !== undefined) updates.billing_postal_code = billing_postal_code;

    db.get('invoices').find({ id: req.params.id }).assign(updates).write();
    res.json(enrichInvoice(db.get('invoices').find({ id: req.params.id }).value(), db));
  });

  router.patch('/:id', authenticate, (req, res) => {
    const invoice = db.get('invoices').find({ id: req.params.id }).value();
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    db.get('invoices').find({ id: req.params.id }).assign(req.body).write();
    res.json(enrichInvoice(db.get('invoices').find({ id: req.params.id }).value(), db));
  });

  return router;
};
