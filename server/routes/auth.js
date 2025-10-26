const express = require('express');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../models/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, phone, address, postcode } = req.body;

  if (!email || !password || !firstName || !lastName || !postcode) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const db = new sqlite3.Database(DB_PATH);
  
  // Extract postcode area (letters before first number)
  const postcodeArea = postcode.toUpperCase().match(/^[A-Z]+/)?.[0] || '';
  
  db.get(
    'SELECT * FROM service_areas WHERE postcode_prefix = ? AND active = 1',
    [postcodeArea],
    async (err, serviceArea) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (!serviceArea) {
        db.close();
        return res.status(400).json({ 
          error: 'Sorry, we do not currently service your area. We cover SW London, Central London, Heathrow, Staines, and Weybridge.' 
        });
      }

      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, existingUser) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingUser) {
          db.close();
          return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
          `INSERT INTO users (email, password, first_name, last_name, phone, address, postcode) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [email, hashedPassword, firstName, lastName, phone, address, postcode],
          function(err) {
            if (err) {
              db.close();
              return res.status(500).json({ error: 'Failed to create user' });
            }

            const userId = this.lastID;
            const token = generateToken({ id: userId, email, is_admin: false });

            db.close();
            res.status(201).json({
              message: 'User registered successfully',
              token,
              user: {
                id: userId,
                email,
                firstName,
                lastName
              }
            });
          }
        );
      });
    }
  );
});

// Login user
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const db = new sqlite3.Database(DB_PATH);

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      db.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      db.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    db.close();
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin
      }
    });
  });
});

// Check if postcode is in service area
router.post('/check-postcode', (req, res) => {
  const { postcode } = req.body;

  if (!postcode) {
    return res.status(400).json({ error: 'Postcode required' });
  }

  // Extract postcode area (letters before first number)
  const postcodeArea = postcode.toUpperCase().match(/^[A-Z]+/)?.[0] || '';
  const db = new sqlite3.Database(DB_PATH);

  db.get(
    'SELECT * FROM service_areas WHERE postcode_prefix = ? AND active = 1',
    [postcodeArea],
    (err, serviceArea) => {
      db.close();

      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (serviceArea) {
        res.json({ 
          inServiceArea: true,
          areaName: serviceArea.area_name 
        });
      } else {
        res.json({ 
          inServiceArea: false,
          message: 'Sorry, we do not currently service your area.' 
        });
      }
    }
  );
});

module.exports = router;
