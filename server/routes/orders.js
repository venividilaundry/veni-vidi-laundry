const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get pricing for dry cleaning items
router.get('/pricing', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);

  db.all('SELECT * FROM pricing ORDER BY category, item_name', (err, items) => {
    db.close();

    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(items);
  });
});

// Create a new order
router.post('/create', authenticateToken, (req, res) => {
  const { orderType, items, totalPrice, pickupDate, specialInstructions } = req.body;
  const userId = req.user.id;

  if (!orderType || !items || !totalPrice || !pickupDate) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const db = new sqlite3.Database(DB_PATH);
  const itemsJson = JSON.stringify(items);

  db.run(
    `INSERT INTO orders (user_id, order_type, items, total_price, pickup_date, special_instructions) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, orderType, itemsJson, totalPrice, pickupDate, specialInstructions || ''],
    function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to create order' });
      }

      const orderId = this.lastID;

      db.close();
      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: orderId,
          orderType,
          items: JSON.parse(itemsJson),
          totalPrice,
          pickupDate,
          status: 'pending'
        }
      });
    }
  );
});

// Get user's orders
router.get('/my-orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const db = new sqlite3.Database(DB_PATH);

  db.all(
    `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
    (err, orders) => {
      db.close();

      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Parse items JSON for each order
      const parsedOrders = orders.map(order => ({
        ...order,
        items: JSON.parse(order.items)
      }));

      res.json(parsedOrders);
    }
  );
});

// Get single order details
router.get('/:id', authenticateToken, (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;
  const db = new sqlite3.Database(DB_PATH);

  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId],
    (err, order) => {
      db.close();

      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        ...order,
        items: JSON.parse(order.items)
      });
    }
  );
});

// Update order status (for internal use, but available to users to see)
router.put('/:id/status', authenticateToken, (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  const userId = req.user.id;

  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }

  const db = new sqlite3.Database(DB_PATH);

  db.run(
    'UPDATE orders SET status = ? WHERE id = ? AND user_id = ?',
    [status, orderId, userId],
    function(err) {
      db.close();

      if (err) {
        return res.status(500).json({ error: 'Failed to update order' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({ message: 'Order status updated successfully' });
    }
  );
});

module.exports = router;
