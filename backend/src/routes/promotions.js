const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM promotions WHERE is_active = true
       ORDER BY CASE WHEN external_id LIKE 'TS%' THEN 0 ELSE 1 END,
                start_date DESC NULLS LAST, id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
