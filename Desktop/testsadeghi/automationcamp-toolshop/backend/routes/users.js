const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRole } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  const safe = (user) => { const { password: _, ...u } = user; return u; };

  router.get('/', authenticate, requireRole('admin'), (req, res) => {
    const { q, _page = 1, _limit = 10, _sort, _order = 'asc' } = req.query;
    let users = db.get('users').value();

    if (q) {
      const query = q.toLowerCase();
      users = users.filter(u =>
        u.first_name.toLowerCase().includes(query) ||
        u.last_name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    if (_sort) {
      users = users.sort((a, b) => {
        const av = (a[_sort] || '').toString().toLowerCase();
        const bv = (b[_sort] || '').toString().toLowerCase();
        return _order === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv);
      });
    }

    const total = users.length;
    const page = parseInt(_page);
    const limit = parseInt(_limit);
    const start = (page - 1) * limit;
    const paginated = users.slice(start, start + limit).map(safe);

    res.set('X-Total-Count', total);
    res.json({ data: paginated, total, page, per_page: limit, last_page: Math.ceil(total / limit) });
  });

  router.get('/search', authenticate, requireRole('admin'), (req, res) => {
    const { q = '' } = req.query;
    const query = q.toLowerCase();
    const users = db.get('users').value()
      .filter(u =>
        u.first_name.toLowerCase().includes(query) ||
        u.last_name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      )
      .map(safe);
    res.json({ data: users });
  });

  router.get('/:id', authenticate, (req, res) => {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = db.get('users').find({ id: req.params.id }).value();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(safe(user));
  });

  router.put('/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = db.get('users').find({ id: req.params.id }).value();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { password, role, ...rest } = req.body;
    const updates = { ...rest };

    if (req.user.role === 'admin' && role) {
      updates.role = role;
    }
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    db.get('users').find({ id: req.params.id }).assign(updates).write();
    const updated = db.get('users').find({ id: req.params.id }).value();
    res.json(safe(updated));
  });

  router.patch('/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = db.get('users').find({ id: req.params.id }).value();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { password, role, ...rest } = req.body;
    const updates = { ...rest };

    if (req.user.role === 'admin' && role !== undefined) {
      updates.role = role;
    }
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    db.get('users').find({ id: req.params.id }).assign(updates).write();
    const updated = db.get('users').find({ id: req.params.id }).value();
    res.json(safe(updated));
  });

  router.post('/', authenticate, requireRole('admin'), async (req, res) => {
    const { first_name, last_name, email, password, role = 'user', phone, dob, street, house_number, city, state, country, postal_code, enabled = true } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    if (db.get('users').find({ email }).value()) {
      return res.status(422).json({ message: 'Email is already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user-${uuidv4()}`,
      first_name, last_name, email,
      password: hashed,
      role, enabled,
      phone: phone || '', dob: dob || '',
      street: street || '', house_number: house_number || '',
      city: city || '', state: state || '',
      country: country || '', postal_code: postal_code || '',
      failed_login_attempts: 0,
      created_at: new Date().toISOString(),
    };

    db.get('users').push(newUser).write();
    res.status(201).json(safe(newUser));
  });

  router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
    const user = db.get('users').find({ id: req.params.id }).value();
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    db.get('users').remove({ id: req.params.id }).write();
    res.status(204).send();
  });

  return router;
};
