const express = require('express');
const router = express.Router();
const pool = require('../db');

async function generateOrderCode(client) {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const prefix = `ORD${year}${month}`;
  const result = await client.query(
    `SELECT order_code FROM orders WHERE order_code LIKE $1 ORDER BY order_code DESC LIMIT 1`,
    [`${prefix}%`]
  );
  const last = result.rows[0]?.order_code;
  const next = last ? parseInt(last.slice(7)) + 1 : 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

// POST /api/orders — สร้างออร์เดอร์ใหม่
router.post('/', async (req, res) => {
  const { member_id, member_code, items, note } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'ไม่มีสินค้าในตะกร้า' });
  }

  const total_amount = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const order_code = await generateOrderCode(client);

    const orderRes = await client.query(
      `INSERT INTO orders (order_code, member_id, member_code, total_amount, note)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [order_code, member_id || null, member_code || null, total_amount, note || null]
    );
    const order = orderRes.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.id, item.name, item.price, item.quantity, Number(item.price) * item.quantity]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'สั่งซื้อสำเร็จ', order });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/orders/member/:member_code — ประวัติออร์เดอร์ของสมาชิก
router.get('/member/:member_code', async (req, res) => {
  try {
    const orders = await pool.query(
      `SELECT o.*, json_agg(
         json_build_object('product_name', oi.product_name, 'price', oi.price, 'quantity', oi.quantity, 'subtotal', oi.subtotal)
       ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.member_code = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.params.member_code]
    );
    res.json(orders.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
