require('dotenv').config();
const pool = require('../db');

const WEBSITE_URL = 'https://skyonline99.com/promotion.php';
const IMAGE_BASE = 'https://member.skyonline99.com/images/ImgProd';

async function fetchPromotions() {
  const res = await fetch(WEBSITE_URL);
  if (!res.ok) throw new Error(`Promotion page returned HTTP ${res.status}`);
  const html = await res.text();
  const itemPattern = /<img\s+src="(https:\/\/member\.skyonline99\.com\/images\/ImgProd\/([A-Za-z0-9_-]+)\.jpg)"[^>]*>[\s\S]*?<div>([^<]+)<\/div>\s*<div>\s*ราคา\s*([\d,.]+)\s*บาท\s*([\d,]+)\s*PV/gi;
  const items = [...html.matchAll(itemPattern)].map((match) => ({
    IDGroupProd: match[2],
    NameGroup: match[3].trim(),
    PriceNet: match[4],
    PVNet: match[5],
    image_url: match[1],
  }));
  if (items.length < 10) throw new Error('Promotion page returned too few items to sync safely');
  return items;
}

async function syncPromotions() {
  const items = await fetchPromotions();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      const externalId = item.IDGroupProd;
      await client.query(
        `INSERT INTO promotions (external_id, title, sale_price, pv, image_url, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (external_id) DO UPDATE SET
           title = EXCLUDED.title,
           sale_price = EXCLUDED.sale_price,
           pv = EXCLUDED.pv,
           image_url = CASE
             WHEN promotions.image_url IS NULL OR promotions.image_url LIKE 'http%'
               THEN EXCLUDED.image_url
             ELSE promotions.image_url
           END,
           is_active = true`,
        [externalId, item.NameGroup, Number(String(item.PriceNet).replaceAll(',', '')), Number(String(item.PVNet).replaceAll(',', '')) || 0, item.image_url || `${IMAGE_BASE}/${externalId}.jpg`]
      );
    }
    await client.query(
      'UPDATE promotions SET is_active = false WHERE external_id IS NOT NULL AND NOT (external_id = ANY($1::text[]))',
      [items.map((item) => item.IDGroupProd)]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  console.log(`Synced ${items.length} promotions.`);
}

syncPromotions()
  .catch((err) => {
    console.error('Sync failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
