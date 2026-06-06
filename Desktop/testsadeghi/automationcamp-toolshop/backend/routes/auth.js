const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { authenticate, generateToken } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  router.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = db.get('users').find({ email }).value();
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.enabled) {
      return res.status(403).json({ message: 'Account is disabled' });
    }

    if (user.failed_login_attempts >= 3) {
      return res.status(423).json({ message: 'Account is locked. Too many failed attempts.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      db.get('users')
        .find({ id: user.id })
        .assign({ failed_login_attempts: (user.failed_login_attempts || 0) + 1 })
        .write();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    db.get('users').find({ id: user.id }).assign({ failed_login_attempts: 0 }).write();
    const token = generateToken(user);

    const { password: _, ...safeUser } = user;
    res.json({ access_token: token, token_type: 'Bearer', expires_in: 86400, user: safeUser });
  });

  router.post('/users/register', async (req, res) => {
    const { first_name, last_name, email, password, phone, dob, street, house_number, city, state, country, postal_code } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'First name, last name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = db.get('users').find({ email }).value();
    if (existing) {
      return res.status(422).json({ message: 'Email is already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user-${uuidv4()}`,
      first_name,
      last_name,
      email,
      password: hashed,
      role: 'user',
      enabled: true,
      phone: phone || '',
      dob: dob || '',
      street: street || '',
      house_number: house_number || '',
      city: city || '',
      state: state || '',
      country: country || '',
      postal_code: postal_code || '',
      failed_login_attempts: 0,
      created_at: new Date().toISOString(),
    };

    db.get('users').push(newUser).write();
    const token = generateToken(newUser);
    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ access_token: token, token_type: 'Bearer', expires_in: 86400, user: safeUser });
  });

  router.post('/users/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = db.get('users').find({ email }).value();
    // Always return success to prevent user enumeration
    res.json({ message: 'If this email exists, a reset link has been sent.' });
  });

  router.post('/users/change-password', authenticate, async (req, res) => {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = db.get('users').find({ id: req.user.id }).value();
    const valid = await bcrypt.compare(current_password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    db.get('users').find({ id: req.user.id }).assign({ password: hashed }).write();
    res.json({ message: 'Password changed successfully' });
  });

  router.get('/users/logout', authenticate, (req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

  router.get('/users/me', authenticate, (req, res) => {
    const user = db.get('users').find({ id: req.user.id }).value();
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  return router;
};
