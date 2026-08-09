const express = require('express');
const router = express.Router();
const pool = require('../db');

const PRODUCT_TRANSLATION_MODEL =
  process.env.PRODUCT_TRANSLATION_MODEL || 'gemini-3.1-flash-lite';
const PRODUCT_TRANSLATION_LOCALES = {
  en: 'English',
  zh: 'Simplified Chinese',
  lo: 'Lao',
  my: 'Burmese',
  vi: 'Vietnamese',
};

function normalizeTranslatedField(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback || '';
}

async function translateProduct(product, locale) {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('Product translation service is not configured');
    error.status = 503;
    throw error;
  }

  const source = {
    name: product.name,
    category: product.category || '',
    description: product.description || '',
    full_description: product.full_description || '',
  };
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(PRODUCT_TRANSLATION_MODEL)}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `Translate this Thai product record into ${PRODUCT_TRANSLATION_LOCALES[locale]} and return JSON only. Preserve product and brand names when they are already Latin-script names. Preserve all numbers, units, ingredient names, registration numbers, line breaks, and warnings. Do not add, remove, strengthen, soften, correct, or infer any product claim. Use exactly these keys: name, category, description, full_description.\n\nSOURCE_JSON:\n${JSON.stringify(source)}`,
          }],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Product translation failed');
    error.status = response.status;
    throw error;
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();
  if (!text) throw new Error('Product translation returned an empty response');

  let translated;
  try {
    translated = JSON.parse(text);
  } catch {
    throw new Error('Product translation returned invalid JSON');
  }

  return {
    name: normalizeTranslatedField(translated.name, product.name),
    category: normalizeTranslatedField(translated.category, product.category),
    description: normalizeTranslatedField(translated.description, product.description),
    full_description: normalizeTranslatedField(
      translated.full_description,
      product.full_description
    ),
  };
}

router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }
    if (featured === 'true') {
      conditions.push('is_featured = true');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(result.rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/translation', async (req, res) => {
  const productId = Number.parseInt(req.params.id, 10);
  const locale = String(req.query.locale || '').toLowerCase();
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }
  if (!PRODUCT_TRANSLATION_LOCALES[locale]) {
    return res.status(400).json({ error: 'Unsupported translation locale' });
  }

  try {
    const cached = await pool.query(
      `SELECT name, category, description, full_description
       FROM product_translations
       WHERE product_id = $1 AND locale = $2`,
      [productId, locale]
    );
    if (cached.rows.length > 0) {
      return res.json(cached.rows[0]);
    }

    const productResult = await pool.query(
      `SELECT id, name, category, description, full_description
       FROM products
       WHERE id = $1`,
      [productId]
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const translated = await translateProduct(productResult.rows[0], locale);
    const saved = await pool.query(
      `INSERT INTO product_translations
         (product_id, locale, name, category, description, full_description)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (product_id, locale) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         description = EXCLUDED.description,
         full_description = EXCLUDED.full_description,
         updated_at = NOW()
       RETURNING name, category, description, full_description`,
      [
        productId,
        locale,
        translated.name,
        translated.category,
        translated.description,
        translated.full_description,
      ]
    );
    return res.json(saved.rows[0]);
  } catch (error) {
    console.error('[products] translation error', error);
    return res.status(error.status || 502).json({
      error: error.message || 'Product translation failed',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'ไม่พบสินค้า' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
