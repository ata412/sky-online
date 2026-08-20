const fs = require('fs');
const path = require('path');
require('dotenv').config();
const pool = require('../db');

async function migrate() {
  const sqlPath = path.join(__dirname, '../db/migrate_add_image_generation_jobs.sql');
  await pool.query(fs.readFileSync(sqlPath, 'utf8'));
  console.log('Image Studio database migration completed');
}

migrate()
  .then(() => pool.end())
  .catch((error) => {
    console.error('Image Studio database migration failed', error);
    process.exitCode = 1;
  });
