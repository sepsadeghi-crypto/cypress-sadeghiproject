const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  router.post('/', (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject and message are required' });
    }

    const msg = {
      id: `msg-${uuidv4()}`,
      user_id: null,
      name, email, subject, message,
      status: 'NEW',
      replies: [],
      created_at: new Date().toISOString(),
    };

    db.get('messages').push(msg).write();
    res.status(201).json(msg);
  });

  router.get('/', authenticate, (req, res) => {
    const { _page = 1, _limit = 10, status, q } = req.query;
    let messages = db.get('messages').value();

    if (req.user.role !== 'admin') {
      messages = messages.filter(m => m.user_id === req.user.id);
    }

    if (status) messages = messages.filter(m => m.status === status);
    if (q) {
      const query = q.toLowerCase();
      messages = messages.filter(m =>
        m.subject.toLowerCase().includes(query) ||
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query)
      );
    }

    messages = messages.sort((a, b) => b.created_at.localeCompare(a.created_at));

    const total = messages.length;
    const page = parseInt(_page);
    const limit = parseInt(_limit);
    const start = (page - 1) * limit;
    const paginated = messages.slice(start, start + limit);

    res.set('X-Total-Count', total);
    res.json({ data: paginated, total, current_page: page, per_page: limit, last_page: Math.ceil(total / limit) });
  });

  router.get('/:id', authenticate, (req, res) => {
    const msg = db.get('messages').find({ id: req.params.id }).value();
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    if (req.user.role !== 'admin' && msg.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(msg);
  });

  router.post('/:id/reply', authenticate, requireRole('admin'), (req, res) => {
    const msg = db.get('messages').find({ id: req.params.id }).value();
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Reply message is required' });

    const reply = {
      id: `reply-${uuidv4()}`,
      user_id: req.user.id,
      message,
      created_at: new Date().toISOString(),
    };

    const replies = [...(msg.replies || []), reply];
    db.get('messages').find({ id: req.params.id }).assign({ replies, status: 'IN_PROGRESS' }).write();
    res.status(201).json(db.get('messages').find({ id: req.params.id }).value());
  });

  router.put('/:id/status', authenticate, requireRole('admin'), (req, res) => {
    const msg = db.get('messages').find({ id: req.params.id }).value();
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    const { status } = req.body;
    const validStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    db.get('messages').find({ id: req.params.id }).assign({ status }).write();
    res.json(db.get('messages').find({ id: req.params.id }).value());
  });

  return router;
};
