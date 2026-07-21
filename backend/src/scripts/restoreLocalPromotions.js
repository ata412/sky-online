const fsp = require('node:fs/promises');
const path = require('node:path');
require('dotenv').config();
const pool = require('../db');
const {
  PUBLIC_DIR,
  downloadImage,
  imageExtension,
  readTableFromBackup,
  slugify,
} = require('./restoreLocalProducts');

const OUTPUT_DIR = path.join(PUBLIC_DIR, 'imported/promotions');
const EXPECTED_COLUMNS = [
  'id', 'title', 'description', 'image_url', 'discount_percent',
  'original_price', 'sale_price', 'start_date', 'end_date', 'is_active',
  'external_id', 'pv',
];

async function downloadPromotionImages(promotions) {
  await fsp.mkdir(OUTPUT_DIR, { recursive: true });
  const prepared = [];

  for (const [index, promotion] of promotions.entries()) {
    if (!promotion.image_url) throw new Error(`โปรโมชั่น ${promotion.id} ไม่มี image_url ใน backup`);
    process.stdout.write(`[${index + 1}/${promotions.length}] ${promotion.title} ... `);

    const image = await downloadImage(promotion.image_url);
    const filename = `${promotion.id}-${slugify(promotion.external_id || promotion.title)}${imageExtension(image.contentType, image.finalUrl)}`;
    const destination = path.join(OUTPUT_DIR, filename);
    const publicPath = `/imported/promotions/${filename}`;
    await fsp.writeFile(destination, image.buffer);
    prepared.push({ ...promotion, image_url: publicPath });
    console.log('สำเร็จ');
  }

  return prepared;
}

function numberOrNull(value) {
  return value === null ? null : Number(value);
}

async function replaceRailwayPromotions(promotions) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE promotions RESTART IDENTITY');

    for (const promotion of promotions) {
      await client.query(
        `INSERT INTO promotions
          (id, title, description, image_url, discount_percent, original_price,
           sale_price, start_date, end_date, is_active, external_id, pv)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          Number(promotion.id), promotion.title, promotion.description,
          promotion.image_url, numberOrNull(promotion.discount_percent),
          promotion.original_price, promotion.sale_price, promotion.start_date,
          promotion.end_date, promotion.is_active === 't', promotion.external_id,
          Number(promotion.pv || 0),
        ]
      );
    }

    await client.query(
      `SELECT setval(
         pg_get_serial_sequence('promotions', 'id'),
         (SELECT MAX(id) FROM promotions),
         true
       )`
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  console.log('อ่านโปรโมชั่นจาก local backup...');
  const promotions = readTableFromBackup('promotions', EXPECTED_COLUMNS);
  console.log(`พบ ${promotions.length} โปรโมชั่น กำลังดาวน์โหลดรูป...`);
  const prepared = await downloadPromotionImages(promotions);
  console.log('ดาวน์โหลดครบ กำลังแทนข้อมูล promotions ใน Railway...');
  await replaceRailwayPromotions(prepared);
  console.log(`เสร็จสมบูรณ์: คืนโปรโมชั่นเดิม ${prepared.length} รายการพร้อมรูป local ครบ`);
}

main()
  .catch((error) => {
    console.error('กู้คืนโปรโมชั่นไม่สำเร็จ:', error.stack || error.message || error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
