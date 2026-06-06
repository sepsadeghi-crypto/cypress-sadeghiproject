const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRole } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  function buildTree(categories, parentId = null) {
    return categories
      .filter(c => c.parent_id === parentId)
      .map(c => ({ ...c, children: buildTree(categories, c.id) }));
  }

  router.get('/tree', (req, res) => {
    const categories = db.get('categories').value();
    res.json(buildTree(categories));
  });

  router.get('/', (req, res) => {
    const { q, parent_id } = req.query;
    let categories = db.get('categories').value();

    if (q) {
      const query = q.toLowerCase();
      categories = categories.filter(c => c.name.toLowerCase().includes(query));
    }
    if (parent_id !== undefined) {
      categories = categories.filter(c => c.parent_id === (parent_id === 'null' ? null : parent_id));
    }

    res.json(categories);
  });

  router.get('/search', (req, res) => {
    const { q = '' } = req.query;
    const query = q.toLowerCase();
    const cats = db.get('categories').value()
      .filter(c => c.name.toLowerCase().includes(query));
    res.json(cats);
  });

  router.get('/:id', (req, res) => {
    const cat = db.get('categories').find({ id: req.params.id }).value();
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    const children = buildTree(db.get('categories').value(), cat.id);
    res.json({ ...cat, children });
  });

  router.post('/', authenticate, (req, res) => {
    const { name, slug, parent_id = null } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (db.get('categories').find({ slug: finalSlug }).value()) {
      return res.status(422).json({ message: 'Slug already exists' });
    }

    const cat = { id: `cat-${uuidv4()}`, name, slug: finalSlug, parent_id, created_at: new Date().toISOString() };
    db.get('categories').push(cat).write();
    res.status(201).json(cat);
  });

  router.put('/:id', authenticate, (req, res) => {
    const cat = db.get('categories').find({ id: req.params.id }).value();
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    const { name, slug, parent_id } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (parent_id !== undefined) updates.parent_id = parent_id;

    db.get('categories').find({ id: req.params.id }).assign(updates).write();
    res.json(db.get('categories').find({ id: req.params.id }).value());
  });

  router.patch('/:id', authenticate, (req, res) => {
    const cat = db.get('categories').find({ id: req.params.id }).value();
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    db.get('categories').find({ id: req.params.id }).assign(req.body).write();
    res.json(db.get('categories').find({ id: req.params.id }).value());
  });

  router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
    const cat = db.get('categories').find({ id: req.params.id }).value();
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    db.get('categories').remove({ id: req.params.id }).write();
    res.status(204).send();
  });

  return router;
};
