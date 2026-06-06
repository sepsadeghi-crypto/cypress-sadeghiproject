const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const brandRoutes = require('./routes/brands');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/carts');
const invoiceRoutes = require('./routes/invoices');
const favoriteRoutes = require('./routes/favorites');
const messageRoutes = require('./routes/messages');
const paymentRoutes = require('./routes/payment');
const reportRoutes = require('./routes/reports');

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*', exposedHeaders: ['X-Total-Count'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

async function hashPlainPasswords() {
  const users = db.get('users').value();
  let changed = false;
  for (const user of users) {
    if (user.password && !user.password.startsWith('$2')) {
      const hashed = await bcrypt.hash(user.password, 10);
      db.get('users').find({ id: user.id }).assign({ password: hashed }).write();
      changed = true;
    }
  }
  if (changed) {
    console.log('Passwords hashed successfully');
  }
}

app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    message: 'Toolshop API is running',
  });
});

app.use('/api', authRoutes(db));
app.use('/api/users', userRoutes(db));
app.use('/api/brands', brandRoutes(db));
app.use('/api/categories', categoryRoutes(db));
app.use('/api/products', productRoutes(db));
app.use('/api/carts', cartRoutes(db));
app.use('/api/invoices', invoiceRoutes(db));
app.use('/api/favorites', favoriteRoutes(db));
app.use('/api/messages', messageRoutes(db));
app.use('/api/payment', paymentRoutes(db));
app.use('/api/reports', reportRoutes(db));

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

hashPlainPasswords().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🔧 Toolshop Backend running on http://localhost:${PORT}`);
    console.log(`📚 API docs: http://localhost:${PORT}/api/status`);
    console.log('\nDefault credentials:');
    console.log('  Admin: admin@automationcamp.org / welcome01');
    console.log('  Customer: customer@automationcamp.org / welcome01\n');
  });
});
