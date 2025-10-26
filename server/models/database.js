const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/veni_vidi.db');

function initDatabase() {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      return;
    }
    console.log('Connected to SQLite database');
  });

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      postcode TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_admin BOOLEAN DEFAULT 0
    )
  `);

  // Subscriptions table
  db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subscription_type TEXT NOT NULL,
      tier INTEGER NOT NULL,
      frequency TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      stripe_subscription_id TEXT,
      next_pickup_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_type TEXT NOT NULL,
      items TEXT NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      pickup_date DATE NOT NULL,
      delivery_date DATE,
      status TEXT DEFAULT 'pending',
      stripe_payment_id TEXT,
      subscription_id INTEGER,
      special_instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
    )
  `);

  // Service areas (postcodes)
  db.run(`
    CREATE TABLE IF NOT EXISTS service_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postcode_prefix TEXT UNIQUE NOT NULL,
      area_name TEXT NOT NULL,
      active BOOLEAN DEFAULT 1
    )
  `);

  // Insert initial service areas (SW London, Heathrow area, Staines, Weybridge)
  const serviceAreas = [
    { prefix: 'SW', area: 'South West London' },
    { prefix: 'W', area: 'West London' },
    { prefix: 'TW', area: 'Twickenham/Heathrow/Staines Area' },
    { prefix: 'KT13', area: 'Weybridge' },
    { prefix: 'KT15', area: 'Weybridge' },
    { prefix: 'WC', area: 'Central London' },
    { prefix: 'EC', area: 'Central London' }
  ];

  const insertArea = db.prepare(`
    INSERT OR IGNORE INTO service_areas (postcode_prefix, area_name) 
    VALUES (?, ?)
  `);

  serviceAreas.forEach(area => {
    insertArea.run(area.prefix, area.area);
  });

  insertArea.finalize();

  // Pricing table for a la carte items
  db.run(`
    CREATE TABLE IF NOT EXISTS pricing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      description TEXT
    )
  `);

  // Insert initial pricing for dry cleaning items
  const pricingItems = [
    { item: 'Shirt', category: 'dry_clean', price: 3.50, desc: 'Professionally cleaned and pressed' },
    { item: 'Trousers', category: 'dry_clean', price: 5.00, desc: 'Professionally cleaned and pressed' },
    { item: 'Suit (2 piece)', category: 'dry_clean', price: 15.00, desc: 'Jacket and trousers' },
    { item: 'Suit (3 piece)', category: 'dry_clean', price: 20.00, desc: 'Jacket, trousers, and waistcoat' },
    { item: 'Dress', category: 'dry_clean', price: 12.00, desc: 'Standard dress' },
    { item: 'Evening Dress', category: 'dry_clean', price: 18.00, desc: 'Formal or evening gown' },
    { item: 'Coat', category: 'dry_clean', price: 14.00, desc: 'Standard coat' },
    { item: 'Winter Coat', category: 'dry_clean', price: 18.00, desc: 'Heavy winter coat' },
    { item: 'Blazer/Jacket', category: 'dry_clean', price: 8.50, desc: 'Casual or formal jacket' },
    { item: 'Skirt', category: 'dry_clean', price: 6.00, desc: 'Any length skirt' },
    { item: 'Jumper/Sweater', category: 'dry_clean', price: 7.00, desc: 'Wool or delicate knitwear' },
    { item: 'Tie', category: 'dry_clean', price: 4.00, desc: 'Standard tie' },
    { item: 'Duvet (Single)', category: 'dry_clean', price: 18.00, desc: 'Single size duvet' },
    { item: 'Duvet (Double)', category: 'dry_clean', price: 24.00, desc: 'Double size duvet' },
    { item: 'Duvet (King)', category: 'dry_clean', price: 28.00, desc: 'King size duvet' }
  ];

  const insertPricing = db.prepare(`
    INSERT OR IGNORE INTO pricing (item_name, category, price, description) 
    VALUES (?, ?, ?, ?)
  `);

  pricingItems.forEach(item => {
    insertPricing.run(item.item, item.category, item.price, item.desc);
  });

  insertPricing.finalize();

  console.log('Database initialized successfully');

  return db;
}

module.exports = { initDatabase, DB_PATH };
