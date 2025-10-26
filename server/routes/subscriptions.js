const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

const router = express.Router();

// Subscription pricing configuration
const SUBSCRIPTION_PRICING = {
  laundry: {
    weekly: {
      1: { price: 15.99, description: '1 bag per week' },
      2: { price: 28.99, description: '2 bags per week' },
      3: { price: 39.99, description: '3 bags per week' }
    },
    fortnightly: {
      1: { price: 14.99, description: '1 bag every 2 weeks' },
      2: { price: 26.99, description: '2 bags every 2 weeks' },
      3: { price: 36.99, description: '3 bags every 2 weeks' }
    }
  },
  shirts_trousers: {
    weekly: {
      1: { price: 12.99, description: '5 items per week' },
      2: { price: 22.99, description: '10 items per week' },
      3: { price: 31.99, description: '15 items per week' }
    },
    fortnightly: {
      1: { price: 11.99, description: '5 items every 2 weeks' },
      2: { price: 20.99, description: '10 items every 2 weeks' },
      3: { price: 29.99, description: '15 items every 2 weeks' }
    }
  }
};

// Get subscription pricing
router.get('/pricing', (req, res) => {
  res.json(SUBSCRIPTION_PRICING);
});

// Create new subscription
router.post('/create', authenticateToken, async (req, res) => {
  const { subscriptionType, tier, frequency, pickupDate } = req.body;
  const userId = req.user.id;

  if (!subscriptionType || !tier || !frequency || !pickupDate) {
    return res.status(400).json({ error: 'All fields required' });
  }

  // Validate subscription type and tier
  if (!SUBSCRIPTION_PRICING[subscriptionType] || !SUBSCRIPTION_PRICING[subscriptionType][frequency] || !SUBSCRIPTION_PRICING[subscriptionType][frequency][tier]) {
    return res.status(400).json({ error: 'Invalid subscription configuration' });
  }

  const pricing = SUBSCRIPTION_PRICING[subscriptionType][frequency][tier];
  const db = new sqlite3.Database(DB_PATH);

  // Create subscription
  db.run(
    `INSERT INTO subscriptions (user_id, subscription_type, tier, frequency, next_pickup_date) 
     VALUES (?, ?, ?, ?, ?)`,
    [userId, subscriptionType, tier, frequency, pickupDate],
    function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to create subscription' });
      }

      const subscriptionId = this.lastID;

      db.close();
      res.status(201).json({
        message: 'Subscription created successfully',
        subscription: {
          id: subscriptionId,
          type: subscriptionType,
          tier,
          frequency,
          price: pricing.price,
          description: pricing.description,
          nextPickupDate: pickupDate
        }
      });
    }
  );
});

// Get user's subscriptions
router.get('/my-subscriptions', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const db = new sqlite3.Database(DB_PATH);

  db.all(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, subscriptions) => {
      db.close();

      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Add pricing info to each subscription
      const enrichedSubscriptions = subscriptions.map(sub => {
        const pricing = SUBSCRIPTION_PRICING[sub.subscription_type]?.[sub.frequency]?.[sub.tier];
        return {
          ...sub,
          price: pricing?.price || 0,
          description: pricing?.description || ''
        };
      });

      res.json(enrichedSubscriptions);
    }
  );
});

// Cancel subscription
router.put('/:id/cancel', authenticateToken, (req, res) => {
  const subscriptionId = req.params.id;
  const userId = req.user.id;
  const db = new sqlite3.Database(DB_PATH);

  db.run(
    `UPDATE subscriptions SET status = 'cancelled' 
     WHERE id = ? AND user_id = ?`,
    [subscriptionId, userId],
    function(err) {
      db.close();

      if (err) {
        return res.status(500).json({ error: 'Failed to cancel subscription' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      res.json({ message: 'Subscription cancelled successfully' });
    }
  );
});

module.exports = router;
