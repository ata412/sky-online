require('dotenv').config();
const pool = require('../db');

async function main() {
  await pool.query(
    `ALTER TABLE orders
     ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0`
  );
  console.log('Shipping fee database migration completed');
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('Shipping fee database migration failed:', error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { main };
