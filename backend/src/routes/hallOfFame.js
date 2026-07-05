const express = require('express');
const router = express.Router();
const pool = require('../db');

const LEVEL_ORDER = [
  'Sky Star',
  'Super Star',
  'Manager Director',
  'Vice President',
  'President Black',
  'Diamond Blue',
  'Diamond Crown',
  'Diamond',
];

router.get('/', async (req, res) => {
  try {
    const { year, month } = req.query;
    let query = 'SELECT * FROM hall_of_fame';
    const params = [];
    const conditions = [];

    if (year) {
      conditions.push(`year = $${params.length + 1}`);
      params.push(parseInt(year));
    }
    if (month) {
      conditions.push(`month = $${params.length + 1}`);
      params.push(month);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
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
