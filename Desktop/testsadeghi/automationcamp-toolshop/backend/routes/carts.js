const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = (db) => {
  const router = express.Router();

  function computeCart(cart, db) {
    if (!cart) return null;
    const items = (cart.items || []).map(item => {
      const product = db.get('products').find({ id: item.product_id }).value();
      const unit_price = product ? product.price : item.unit_price || 0;
      const discounted = unit_price * (1 - (item.discount_percentage || 0) / 100);
      return { ...item, product: product || null, unit_price, line_total: discounted * item.quantity };
    });
    const subtotal = items.reduce((sum, i) => sum + i.line_total, 0);
    return { ...cart, items, subtotal: Math.round(subtotal * 100) / 100 };
  }

  router.post('/', (req, res) => {
    const cart = {
      id: uuidv4(),
      items: [],
      created_at: new Date().toISOString(),
    };
    db.get('carts').push(cart).write();
    res.status(201).json(computeCart(cart, db));
  });

  router.get('/:id', (req, res) => {
    const cart = db.get('carts').find({ id: req.params.id }).value();
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json(computeCart(cart, db));
  });

  router.post('/:id', (req, res) => {
    const cart = db.get('carts').find({ id: req.params.id }).value();
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const { product_id, quantity = 1, discount_percentage = 0 } = req.body;
    if (!product_id) return res.status(400).json({ message: 'product_id is required' });

    const product = db.get('products').find({ id: product_id }).value();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const items = cart.items || [];
    const existingIndex = items.findIndex(i => i.product_id === product_id);

    if (existingIndex >= 0) {
      items[existingIndex].quantity += parseInt(quantity);
    } else {
      items.push({
        id: uuidv4(),
        product_id,
        quantity: parseInt(quantity),
        discount_percentage: parseFloat(discount_percentage),
        unit_price: product.price,
      });
    }

    db.get('carts').find({ id: req.params.id }).assign({ items }).write();
    const updated = db.get('carts').find({ id: req.params.id }).value();
    res.json(computeCart(updated, db));
  });

  router.put('/:id/product/quantity', (req, res) => {
    const cart = db.get('carts').find({ id: req.params.id }).value();
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const { product_id, quantity } = req.body;
    if (!product_id || quantity === undefined) {
      return res.status(400).json({ message: 'product_id and quantity are required' });
    }

    const items = (cart.items || []).map(item => {
      if (item.product_id === product_id) {
        return { ...item, quantity: parseInt(quantity) };
      }
      return item;
    }).filter(item => item.quantity > 0);

    db.get('carts').find({ id: req.params.id }).assign({ items }).write();
    const updated = db.get('carts').find({ id: req.params.id }).value();
    res.json(computeCart(updated, db));
  });

  router.delete('/:id/product/:productId', (req, res) => {
    const cart = db.get('carts').find({ id: req.params.id }).value();
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const items = (cart.items || []).filter(i => i.product_id !== req.params.productId);
    db.get('carts').find({ id: req.params.id }).assign({ items }).write();
    const updated = db.get('carts').find({ id: req.params.id }).value();
    res.json(computeCart(updated, db));
  });

  router.delete('/:id', (req, res) => {
    const cart = db.get('carts').find({ id: req.params.id }).value();
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    db.get('carts').remove({ id: req.params.id }).write();
    res.status(204).send();
  });

  return router;
};
