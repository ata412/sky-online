const express = require('express');
const router = express.Router();
const pool = require('../db');

const REMOVED_IMAGE_PATHS = new Set([
  '/imported/hall-of-fame/all/374-director-555942-0.jpg',
  '/imported/hall-of-fame/all/375-director-555943-0.jpg',
  '/imported/hall-of-fame/all/24-sky-star-12.jpg',
  '/imported/hall-of-fame/all/113-sky-star-20.jpg',
]);

const LEVEL_ORDER = [
  'Sky Star',
  'Super Star',
  'Manager',
  'Director',
  'Vice President',
  'President',
  'Diamond',
  'Red Diamond',
  'Black Diamond',
  'Blue Diamond',
  'Crown Diamond',
];

router.get('/', async (req, res) => {
  try {
    const { level } = req.query;
    let query = 'SELECT * FROM hall_of_fame';
    const params = [];

    if (level) {
      query += ' WHERE level = $1';
      params.push(level);
    }

    const result = await pool.query(query, params);
    const visibleRows = result.rows.filter((row) => {
      if (!row.image_url) return true;
      const imagePath = new URL(row.image_url, 'https://skyonline99.online').pathname;
      return !REMOVED_IMAGE_PATHS.has(imagePath);
    });
    const sorted = visibleRows.sort(
      (a, b) => LEVEL_ORDER.indexOf(b.level) - LEVEL_ORDER.indexOf(a.level)
    );
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/levels', (req, res) => {
  res.json(LEVEL_ORDER);
});

module.exports = router;
