const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.post('/check', (req, res) => {
    const { payment_method, payment_details } = req.body;

    if (!payment_method) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const errors = {};

    if (payment_method === 'credit_card') {
      const { card_number, expiry, cvv, holder_name } = payment_details || {};
      if (!card_number || !/^\d{16}$/.test(card_number.replace(/\s/g, ''))) {
        errors.card_number = 'Invalid card number (must be 16 digits)';
      }
      if (!expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        errors.expiry = 'Invalid expiry date (format MM/YY)';
      } else {
        const [month, year] = expiry.split('/');
        const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        if (expDate < new Date()) {
          errors.expiry = 'Card is expired';
        }
      }
      if (!cvv || !/^\d{3,4}$/.test(cvv)) {
        errors.cvv = 'Invalid CVV (3-4 digits)';
      }
      if (!holder_name || holder_name.trim().length < 2) {
        errors.holder_name = 'Card holder name is required';
      }
    } else if (payment_method === 'bank_transfer') {
      const { bank_name, account_name, account_number } = payment_details || {};
      if (!bank_name) errors.bank_name = 'Bank name is required';
      if (!account_name) errors.account_name = 'Account name is required';
      if (!account_number) errors.account_number = 'Account number is required';
    } else if (payment_method === 'gift_card') {
      const { gift_card_number, validation_code } = payment_details || {};
      if (!gift_card_number || gift_card_number.length < 8) {
        errors.gift_card_number = 'Invalid gift card number';
      }
      if (!validation_code || validation_code.length < 4) {
        errors.validation_code = 'Invalid validation code';
      }
    } else if (payment_method === 'buy_now_pay_later') {
      const { monthly_installments } = payment_details || {};
      if (!monthly_installments || ![3, 6, 12].includes(parseInt(monthly_installments))) {
        errors.monthly_installments = 'Invalid installments (must be 3, 6, or 12)';
      }
    } else if (payment_method === 'cash_on_delivery') {
      // No validation needed
    } else {
      return res.status(400).json({ message: 'Unsupported payment method' });
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: 'Payment validation failed', errors });
    }

    res.json({ valid: true, message: 'Payment details are valid' });
  });

  return router;
};
