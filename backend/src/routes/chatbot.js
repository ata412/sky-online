const express = require('express');
const router = express.Router();
const pool = require('../db');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';

function asksForTotalProductCount(message) {
  const normalized = String(message || '')
    .toLowerCase()
    .replace(/[?？.,!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const mentionsProducts = /(สินค้า|ผลิตภัณฑ์|product)/.test(normalized);
  const asksForCount = /(กี่\s*(รายการ|อย่าง|ชิ้น|ตัว|ชนิด)|จำนวน\s*(สินค้า|ผลิตภัณฑ์)|how many)/.test(normalized);
  const meansAllProducts = /(ทั้งหมด|ทั้งร้าน|รวม(?:แล้ว)?|ในร้าน|มีสินค้า|มีผลิตภัณฑ์|(?:สินค้า|ผลิตภัณฑ์)\s*มี\s*กี่|total|ทั้งหมดมีกี่)/.test(normalized);
  const asksAboutInventory = /(คงเหลือ|เหลือกี่|ในสต็อก|สต็อก|stock|inventory)/.test(normalized);

  return mentionsProducts && asksForCount && meansAllProducts && !asksAboutInventory;
}

async function getProductCount() {
  const result = await pool.query('SELECT COUNT(*)::int AS total FROM products');
  return result.rows[0].total;
}

async function buildProductContext() {
  const result = await pool.query(
    'SELECT name, brand, category, price, description FROM products ORDER BY category'
  );
  const context = result.rows
    .map((p) => `- ${p.name} (${p.brand}, ${p.category}) ราคา ${p.price} บาท: ${p.description}`)
    .join('\n');
  return { context, total: result.rowCount };
}

router.post('/', async (req, res) => {
  const { message, history } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'กรุณาพิมพ์คำถาม' });
  }

  try {
    if (asksForTotalProductCount(message)) {
      const total = await getProductCount();
      return res.json({ reply: `ปัจจุบัน Sky Online มีสินค้าทั้งหมด ${total} รายการครับ` });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์' });
    }

    const { context: productContext, total: productCount } = await buildProductContext();
    const systemInstruction = {
      parts: [{
        text: `คุณเป็นผู้ช่วยตอบคำถามเกี่ยวกับสินค้าของร้าน Sky Online เท่านั้น ตอบเป็นภาษาไทย กระชับ สุภาพ ห้ามแต่งข้อมูลสินค้าที่ไม่มีในรายการ ปัจจุบันมีสินค้าทั้งหมด ${productCount} รายการ ห้ามนับจำนวนรายการเอง ห้ามระบุหรือคาดเดาจำนวนสินค้าคงเหลือ หากลูกค้าถามสต็อกหรือจำนวนคงเหลือ ให้แนะนำให้ติดต่อทีมงานผ่านหน้า "ติดต่อเรา" ถ้าลูกค้าถามนอกเรื่องสินค้า ให้แนะนำให้ติดต่อทีมงานผ่านหน้า "ติดต่อเรา" แทน\n\nรายการสินค้าปัจจุบัน:\n${productContext}`,
      }],
    };

    const contents = [
      ...(Array.isArray(history) ? history.slice(-10).map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(h.text || '') }],
      })) : []),
      { role: 'user', parts: [{ text: message }] },
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction,
        generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
      }),
    });

    const data = await geminiRes.json();
    if (!geminiRes.ok) {
      console.error('[chatbot] Gemini API error', data);
      return res.status(502).json({ error: 'เชื่อมต่อ AI ไม่สำเร็จ กรุณาลองใหม่' });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    const sanitizedReply = reply.replace(/\*/g, ' ');
    res.json({ reply: sanitizedReply || 'ขออภัย ไม่สามารถตอบคำถามนี้ได้ในขณะนี้' });
  } catch (err) {
    console.error('[chatbot] error', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.asksForTotalProductCount = asksForTotalProductCount;
