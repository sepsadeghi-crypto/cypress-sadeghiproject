const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  function enrichFavorite(fav, db) {
    const product = db.get('products').find({ id: fav.product_id }).value();
    if (product) {
      const brand = db.get('brands').find({ id: product.brand_id }).value();
      const category = db.get('categories').find({ id: product.category_id }).value();
      return { ...fav, product: { ...product, brand: brand || null, category: category || null } };
    }
    return { ...fav, product: null };
  }

  router.get('/', authenticate, (req, res) => {
    const favs = db.get('favorites').value()
      .filter(f => f.user_id === req.user.id)
      .map(f => enrichFavorite(f, db));
    res.json(favs);
  });

  router.post('/', authenticate, (req, res) => {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ message: 'product_id is required' });

    const product = db.get('products').find({ id: product_id }).value();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const exists = db.get('favorites').find({ user_id: req.user.id, product_id }).value();
    if (exists) return res.status(409).json({ message: 'Already in favorites' });

    const fav = { id: `fav-${uuidv4()}`, user_id: req.user.id, product_id, created_at: new Date().toISOString() };
    db.get('favorites').push(fav).write();
    res.status(201).json(enrichFavorite(fav, db));
  });

  router.get('/:id', authenticate, (req, res) => {
    const fav = db.get('favorites').find({ id: req.params.id }).value();
    if (!fav) return res.status(404).json({ message: 'Favorite not found' });
    if (fav.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    res.json(enrichFavorite(fav, db));
  });

  router.delete('/:id', authenticate, (req, res) => {
    const fav = db.get('favorites').find({ id: req.params.id }).value();
    if (!fav) return res.status(404).json({ message: 'Favorite not found' });
    if (fav.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    db.get('favorites').remove({ id: req.params.id }).write();
    res.status(204).send();
  });

  return router;
};
