const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../models/database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all orders (admin only)
router.get('/orders', authenticateAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);

  db.all(
    `SELECT orders.*, users.first_name, users.last_name, users.email, users.phone, users.address, users.postcode 
     FROM orders 
     JOIN users ON orders.user_id = users.id 
     ORDER BY orders.created_at DESC`,
    (err, orders) => {
      db.close();

      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const parsedOrders = orders.map(order => ({
        ...order,
        items: JSON.parse(order.items)
      }));

      res.json(parsedOrders);
    }
  );
});

// Get all subscriptions (admin only)
router.get('/subscriptions', authenticateAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);

  db.all(
    `SELECT subscriptions.*, users.first_name, users.last_name, users.email, users.phone, users.address, users.postcode 
     FROM subscriptions 
     JOIN users ON subscriptions.user_id = users.id 
     ORDER BY subscriptions.created_at DESC`,
    (err, subscriptions) => {
      db.close();

      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(subscriptions);
    }
  );
});

// Update order status (admin only)
router.put('/orders/:id/status', authenticateAdmin, (req, res) => {
  const orderId = req.params.id;
  const { status, deliveryDate } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }

  const db = new sqlite3.Database(DB_PATH);

  let query = 'UPDATE orders SET status = ?';
  let params = [status];

  if (deliveryDate) {
    query += ', delivery_date = ?';
    params.push(deliveryDate);
  }

  query += ' WHERE id = ?';
  params.push(orderId);

  db.run(query, params, function(err) {
    db.close();

    if (err) {
      return res.status(500).json({ error: 'Failed to update order' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order updated successfully' });
  });
});

// Get dashboard statistics (admin only)
router.get('/dashboard', authenticateAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);

  const stats = {};

  // Get total orders
  db.get('SELECT COUNT(*) as count FROM orders', (err, result) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Database error' });
    }
    stats.totalOrders = result.count;

    // Get active subscriptions
    db.get('SELECT COUNT(*) as count FROM subscriptions WHERE status = "active"', (err, result) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }
      stats.activeSubscriptions = result.count;

      // Get total customers
      db.get('SELECT COUNT(*) as count FROM users WHERE is_admin = 0', (err, result) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }
        stats.totalCustomers = result.count;

        // Get pending orders
        db.get('SELECT COUNT(*) as count FROM orders WHERE status = "pending"', (err, result) => {
          db.close();

          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          stats.pendingOrders = result.count;

          res.json(stats);
        });
      });
    });
  });
});

// Get all customers (admin only)
router.get('/customers', authenticateAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);

  db.all(
    'SELECT id, email, first_name, last_name, phone, address, postcode, created_at FROM users WHERE is_admin = 0 ORDER BY created_at DESC',
    (err, customers) => {
      db.close();

      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(customers);
    }
  );
});

module.exports = router;
