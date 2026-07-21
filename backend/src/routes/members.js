const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');

async function generateMemberCode(client) {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `BL${year}`;
  const result = await client.query(
    `SELECT member_code FROM members WHERE member_code LIKE $1 ORDER BY member_code DESC LIMIT 1`,
    [`${prefix}%`]
  );
  const lastCode = result.rows[0]?.member_code;
  const nextNum = lastCode ? parseInt(lastCode.slice(4)) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(5, '0')}`;
}

router.post('/register', async (req, res) => {
  const { first_name, last_name, email, phone, password, birth_date, province, address, referrer_code } = req.body;

  if (!first_name?.trim() || !last_name?.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อและนามสกุล' });
  }
  if (!email?.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมล' });
  }
  if (!phone?.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกเบอร์โทรศัพท์' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
  }

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM members WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    if (referrer_code?.trim()) {
      const ref = await client.query('SELECT id FROM members WHERE member_code = $1', [referrer_code.trim().toUpperCase()]);
      if (ref.rows.length === 0) {
        return res.status(400).json({ error: 'ไม่พบรหัสผู้แนะนำ กรุณาตรวจสอบอีกครั้ง' });
      }
    }

    const password_hash = await bcrypt.hash(password, 10);
    const member_code = await generateMemberCode(client);

    const result = await client.query(
      `INSERT INTO members (first_name, last_name, email, phone, password_hash, birth_date, province, address, referrer_code, member_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, member_code, first_name, last_name, email, created_at`,
      [
        first_name.trim(),
        last_name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        password_hash,
        birth_date || null,
        province?.trim() || null,
        address?.trim() || null,
        referrer_code?.trim().toUpperCase() || null,
        member_code,
      ]
    );

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ!',
      member: result.rows[0],
    });
  } finally {
    client.release();
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }
  try {
    const result = await pool.query(
      'SELECT id, member_code, first_name, last_name, email, phone, province, status, total_pv, password_hash FROM members WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }
    const member = result.rows[0];
    const valid = await bcrypt.compare(password, member.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }
    const { password_hash, ...memberData } = member;
    res.json({ message: 'เข้าสู่ระบบสำเร็จ', member: memberData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, member_code, first_name, last_name, email, phone, province, status, created_at FROM members ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
