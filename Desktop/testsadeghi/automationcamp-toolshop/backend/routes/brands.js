const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRole } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    const { q, _sort, _order = 'asc' } = req.query;
    let brands = db.get('brands').value();

    if (q) {
      const query = q.toLowerCase();
      brands = brands.filter(b => b.name.toLowerCase().includes(query) || b.slug.toLowerCase().includes(query));
    }

    if (_sort) {
      brands = brands.sort((a, b) => {
        const av = (a[_sort] || '').toString().toLowerCase();
        const bv = (b[_sort] || '').toString().toLowerCase();
        return _order === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv);
      });
    }

    res.json(brands);
  });

  router.get('/search', (req, res) => {
    const { q = '' } = req.query;
    const query = q.toLowerCase();
    const brands = db.get('brands').value()
      .filter(b => b.name.toLowerCase().includes(query) || b.slug.toLowerCase().includes(query));
    res.json(brands);
  });

  router.get('/:id', (req, res) => {
    const brand = db.get('brands').find({ id: req.params.id }).value();
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  });

  router.post('/', authenticate, (req, res) => {
    const { name, slug } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (db.get('brands').find({ slug: finalSlug }).value()) {
      return res.status(422).json({ message: 'Slug already exists' });
    }

    const brand = { id: `brand-${uuidv4()}`, name, slug: finalSlug, created_at: new Date().toISOString() };
    db.get('brands').push(brand).write();
    res.status(201).json(brand);
  });

  router.put('/:id', authenticate, (req, res) => {
    const brand = db.get('brands').find({ id: req.params.id }).value();
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    const { name, slug } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (slug) updates.slug = slug;

    db.get('brands').find({ id: req.params.id }).assign(updates).write();
    res.json(db.get('brands').find({ id: req.params.id }).value());
  });

  router.patch('/:id', authenticate, (req, res) => {
    const brand = db.get('brands').find({ id: req.params.id }).value();
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    db.get('brands').find({ id: req.params.id }).assign(req.body).write();
    res.json(db.get('brands').find({ id: req.params.id }).value());
  });

  router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
    const brand = db.get('brands').find({ id: req.params.id }).value();
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    db.get('brands').remove({ id: req.params.id }).write();
    res.status(204).send();
  });

  return router;
};
