const fs = require('fs');
const path = require('path');
require('dotenv').config();
const pool = require('../db');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, '../db/migrate_content_translations.sql'), 'utf8');
  await pool.query(sql);
  console.log('Content translations database migration completed');
}

migrate()
  .catch((error) => {
    console.error('Content translations database migration failed', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
