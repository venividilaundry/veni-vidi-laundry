const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../models/database');

const router = express.Router();

router.post('/make-admin', (req, res) => {
  const { email, secretKey } = req.body;

  if (secretKey !== 'setup-vvl-2025') {
    return res.status(403).json({ error: 'Invalid secret key' });
  }

  const db = new sqlite3.Database(DB_PATH);

  db.run(
    'UPDATE users SET is_admin = 1 WHERE email = ?',
    [email],
    function(err) {
      db.close();

      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ 
        message: 'User is now admin!',
        email: email
      });
    }
  );
});

module.exports = router;
