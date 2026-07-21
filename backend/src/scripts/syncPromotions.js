require('dotenv').config();
const pool = require('../db');

const API_URL = 'https://api.skyonline99.com/getPromotion.php';
const IMAGE_BASE = 'https://member.skyonline99.com/images/ImgProd';

async function fetchPromotions() {
  const token = process.env.SKYONLINE99_TOKEN;
  if (!token) throw new Error('Missing SKYONLINE99_TOKEN in .env');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }),
  });
  const data = await res.json();

  if (data.code !== '00' || !String(data.status).startsWith('success')) {
    throw new Error(`API returned an error: ${JSON.stringify(data)}`);
  }

  return Object.entries(data)
    .filter(([key]) => /^\d+$/.test(key))
    .map(([, item]) => item);
}

async function syncPromotions() {
  const items = await fetchPromotions();

  for (const item of items) {
    const externalId = item.IDGroupProd;
    await pool.query(
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
      [externalId, item.NameGroup, parseFloat(item.PriceNet), parseInt(item.PVNet, 10) || 0, `${IMAGE_BASE}/${externalId}.jpg`]
    );
  }

  console.log(`Synced ${items.length} promotions.`);
}

syncPromotions()
  .catch((err) => {
    console.error('Sync failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
