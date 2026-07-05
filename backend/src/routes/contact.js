const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'กรุณากรอกชื่อ' });
    }
    const result = await pool.query(
      'INSERT INTO contact_requests (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [name.trim(), email?.trim() || null, phone?.trim() || null, message?.trim() || null]
    );
    res.status(201).json({ message: 'ส่งข้อมูลเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็ว', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
