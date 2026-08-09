const fs = require('fs');
const path = require('path');
require('dotenv').config();
const pool = require('../db');

async function migrate() {
  const sqlPath = path.join(__dirname, '../db/migrate_add_product_translations.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await pool.query(sql);
  console.log('Product translations database migration completed');
}

migrate()
  .catch((error) => {
    console.error('Product translations database migration failed', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
