const express = require('express');
const router = express.Router();
const pool = require('../db');
const {
  BULK_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} = require('../lib/shipping');

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

function asksForProductList(message) {
  const normalized = String(message || '')
    .toLowerCase()
    .replace(/[?？.,!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const mentionsProducts = /(สินค้า|ผลิตภัณฑ์|product)/.test(normalized);
  const asksWhatIsAvailable = /(มี\s*อะไรบ้าง|ขาย\s*อะไรบ้าง|จำหน่าย\s*อะไรบ้าง|สินค้าอะไรบ้าง|ผลิตภัณฑ์อะไรบ้าง|what products)/.test(normalized);
  return mentionsProducts && asksWhatIsAvailable;
}

function asksForShippingRates(message) {
  const normalized = String(message || '').toLowerCase();
  return /(ค่าส่ง|ค่าจัดส่ง|ส่งฟรี|shipping|delivery\s*fee)/.test(normalized);
}

function buildShippingRatesReply() {
  return `ค่าส่งสินค้าของ Sky Online:\n` +
    `- 1–2 รายการ ${STANDARD_SHIPPING_FEE} บาท\n` +
    `- 3 รายการขึ้นไป ${BULK_SHIPPING_FEE} บาท\n` +
    `- ยอดสินค้า ${FREE_SHIPPING_THRESHOLD.toLocaleString('th-TH')} บาทขึ้นไป ส่งฟรีครับ`;
}

function extractPackageInfo(fullDescription) {
  const text = String(fullDescription || '');
  const packages = [...text.matchAll(/(\d+)\s*(ซอง|แคปซูล|เม็ด)(?:\s*\/\s*กล่อง)?/g)]
    .map((match) => ({ count: Number(match[1]), unit: match[2] }))
    .filter(({ count }) => Number.isFinite(count) && count > 0);

  if (packages.length === 0) return 'ไม่ระบุจำนวนบรรจุ';
  const largestPackage = packages.reduce((largest, current) => (
    current.count > largest.count ? current : largest
  ));
  const perSachetWeight = largestPackage.unit === 'ซอง'
    ? text.match(/ซอง(?:\s*ๆ)?\s*ละ\s*(\d+(?:\.\d+)?)\s*กรัม/i)?.[1]
    : null;

  return `${largestPackage.count} ${largestPackage.unit}` +
    (perSachetWeight ? ` ซองละ ${perSachetWeight} กรัม` : '');
}

async function getProductCount() {
  const result = await pool.query('SELECT COUNT(*)::int AS total FROM products');
  return result.rows[0].total;
}

async function buildProductListReply() {
  const result = await pool.query(
    `SELECT name, category, full_description
     FROM products
     ORDER BY category, name`
  );
  const groups = new Map();

  for (const product of result.rows) {
    if (!groups.has(product.category)) groups.set(product.category, []);
    groups.get(product.category).push(
      `- ${product.name} — ${extractPackageInfo(product.full_description)}`
    );
  }

  const sections = [...groups.entries()]
    .map(([category, products]) => `กลุ่ม${category}\n${products.join('\n')}`)
    .join('\n\n');
  return `ปัจจุบัน Sky Online มีสินค้าทั้งหมด ${result.rowCount} รายการครับ\n\n${sections}`;
}

async function buildProductContext() {
  const result = await pool.query(
    `SELECT name, brand, category, price, description, full_description
     FROM products
     ORDER BY category`
  );
  const context = result.rows
    .map((p) => `- ${p.name} (${p.brand}, ${p.category}) ราคา ${p.price} บาท ` +
      `ขนาดบรรจุ ${extractPackageInfo(p.full_description)}: ${p.description}`)
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

    if (asksForProductList(message)) {
      return res.json({ reply: await buildProductListReply() });
    }

    if (asksForShippingRates(message)) {
      return res.json({ reply: buildShippingRatesReply() });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์' });
    }

    const { context: productContext, total: productCount } = await buildProductContext();
    const systemInstruction = {
      parts: [{
        text: `คุณเป็นผู้ช่วยตอบคำถามเกี่ยวกับสินค้าของร้าน Sky Online เท่านั้น ตอบเป็นภาษาไทย กระชับ สุภาพ ห้ามแต่งข้อมูลสินค้าที่ไม่มีในรายการ ปัจจุบันมีสินค้าทั้งหมด ${productCount} รายการ ห้ามนับจำนวนรายการเอง เมื่อกล่าวถึงสินค้าให้ระบุขนาดบรรจุตามข้อมูลที่ให้ไว้ ค่าส่ง 1–2 รายการ ${STANDARD_SHIPPING_FEE} บาท, 3 รายการขึ้นไป ${BULK_SHIPPING_FEE} บาท, ยอดสินค้า ${FREE_SHIPPING_THRESHOLD} บาทขึ้นไปส่งฟรี ห้ามระบุหรือคาดเดาจำนวนสินค้าคงเหลือ หากลูกค้าถามสต็อกหรือจำนวนคงเหลือ ให้แนะนำให้ติดต่อทีมงานผ่านหน้า "ติดต่อเรา" ถ้าลูกค้าถามนอกเรื่องสินค้า ให้แนะนำให้ติดต่อทีมงานผ่านหน้า "ติดต่อเรา" แทน\n\nรายการสินค้าปัจจุบัน:\n${productContext}`,
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
module.exports.asksForProductList = asksForProductList;
module.exports.asksForShippingRates = asksForShippingRates;
module.exports.buildShippingRatesReply = buildShippingRatesReply;
module.exports.extractPackageInfo = extractPackageInfo;
