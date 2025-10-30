const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../models/database');
const router = express.Router();

router.post('/make-admin', (req, res) => {
  const { email, secretKey } = req.body;
  if (secretKey !== 'setup-railway-2025') {
    return res.status(403).json({ error: 'Invalid secret' });
  }
  
  const db = new sqlite3.Database(DB_PATH);
  db.run('UPDATE users SET is_admin = 1 WHERE email = ?', [email], function(err) {
    db.close();
    if (err) return res.status(500).json({ error: 'Failed' });
    res.json({ message: 'Admin access granted!' });
  });
});

module.exports = router;
