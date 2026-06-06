const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRole } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  function enrichProduct(product, db) {
    if (!product) return null;
    const brand = db.get('brands').find({ id: product.brand_id }).value();
    const category = db.get('categories').find({ id: product.category_id }).value();
    return {
      ...product,
      brand: brand || null,
      category: category || null,
      in_stock: product.stock > 0,
      is_eco_friendly: ['A', 'B'].includes(product.co2_rating),
    };
  }

  function getCategoryIdsWithDescendants(categoryId, categories) {
    const ids = new Set([categoryId]);
    const queue = [categoryId];
    while (queue.length) {
      const parentId = queue.shift();
      categories
        .filter(c => c.parent_id === parentId)
        .forEach(c => {
          ids.add(c.id);
          queue.push(c.id);
        });
    }
    return ids;
  }

  router.get('/', (req, res) => {
    const { q, category_id, brand_id, is_rental, min_price, max_price, in_stock, _page = 1, _limit = 9, _sort = 'name', _order = 'asc' } = req.query;

    let products = db.get('products').value();

    if (q) {
      const query = q.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    }
    if (category_id) {
      const categories = db.get('categories').value();
      const allowedCategoryIds = getCategoryIdsWithDescendants(category_id, categories);
      products = products.filter(p => allowedCategoryIds.has(p.category_id));
    }
    if (brand_id) products = products.filter(p => p.brand_id === brand_id);
    if (is_rental !== undefined) products = products.filter(p => p.is_rental === (is_rental === 'true'));
    if (min_price) products = products.filter(p => p.price >= parseFloat(min_price));
    if (max_price) products = products.filter(p => p.price <= parseFloat(max_price));
    if (in_stock === 'true') products = products.filter(p => p.stock > 0);

    products = products.sort((a, b) => {
      const av = _sort === 'price' ? a.price : (a[_sort] || '').toString().toLowerCase();
      const bv = _sort === 'price' ? b.price : (b[_sort] || '').toString().toLowerCase();
      if (typeof av === 'number') return _order === 'desc' ? bv - av : av - bv;
      return _order === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv);
    });

    const total = products.length;
    const page = parseInt(_page);
    const limit = parseInt(_limit);
    const start = (page - 1) * limit;
    const paginated = products.slice(start, start + limit).map(p => enrichProduct(p, db));

    res.set('X-Total-Count', total);
    res.json({
      data: paginated,
      total,
      current_page: page,
      per_page: limit,
      last_page: Math.ceil(total / limit),
    });
  });

  router.get('/search', (req, res) => {
    const { q = '' } = req.query;
    const query = q.toLowerCase();
    const products = db.get('products').value()
      .filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query))
      .map(p => enrichProduct(p, db));
    res.json({ data: products });
  });

  router.get('/:id/related', (req, res) => {
    const product = db.get('products').find({ id: req.params.id }).value();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const related = db.get('products').value()
      .filter(p => p.id !== product.id && (p.category_id === product.category_id || p.brand_id === product.brand_id))
      .slice(0, 4)
      .map(p => enrichProduct(p, db));

    res.json(related);
  });

  router.get('/:id', (req, res) => {
    const product = db.get('products').find({ id: req.params.id }).value();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(enrichProduct(product, db));
  });

  router.post('/', authenticate, (req, res) => {
    const { name, description, stock, price, brand_id, category_id, is_rental = false, is_location_offer = false, co2_rating = 'C', image, specs = [] } = req.body;

    if (!name || !price) return res.status(400).json({ message: 'Name and price are required' });

    const product = {
      id: `prod-${uuidv4()}`,
      name, description: description || '',
      stock: parseInt(stock) || 0,
      price: parseFloat(price),
      brand_id: brand_id || null,
      category_id: category_id || null,
      is_rental, is_location_offer,
      co2_rating,
      image: image || `https://placehold.co/300x200/cccccc/333333?text=${encodeURIComponent(name)}`,
      specs,
      created_at: new Date().toISOString(),
    };

    db.get('products').push(product).write();
    res.status(201).json(enrichProduct(product, db));
  });

  router.put('/:id', authenticate, (req, res) => {
    const product = db.get('products').find({ id: req.params.id }).value();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, stock, price, brand_id, category_id, is_rental, is_location_offer, co2_rating, image, specs } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (price !== undefined) updates.price = parseFloat(price);
    if (brand_id !== undefined) updates.brand_id = brand_id;
    if (category_id !== undefined) updates.category_id = category_id;
    if (is_rental !== undefined) updates.is_rental = is_rental;
    if (is_location_offer !== undefined) updates.is_location_offer = is_location_offer;
    if (co2_rating !== undefined) updates.co2_rating = co2_rating;
    if (image !== undefined) updates.image = image;
    if (specs !== undefined) updates.specs = specs;

    db.get('products').find({ id: req.params.id }).assign(updates).write();
    res.json(enrichProduct(db.get('products').find({ id: req.params.id }).value(), db));
  });

  router.patch('/:id', authenticate, (req, res) => {
    const product = db.get('products').find({ id: req.params.id }).value();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    db.get('products').find({ id: req.params.id }).assign(req.body).write();
    res.json(enrichProduct(db.get('products').find({ id: req.params.id }).value(), db));
  });

  router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
    const product = db.get('products').find({ id: req.params.id }).value();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    db.get('products').remove({ id: req.params.id }).write();
    res.status(204).send();
  });

  return router;
};
