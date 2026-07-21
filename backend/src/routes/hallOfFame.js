const express = require('express');
const router = express.Router();
const pool = require('../db');

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
    const sorted = result.rows.sort(
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
