const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
require('dotenv').config();
const pool = require('../db');

const BACKUP_PATH = path.resolve(__dirname, '../../sky_online_backup.dump');
const PUBLIC_DIR = path.resolve(__dirname, '../../../frontend-next/public');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'imported/products');
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const ALLOWED_IMAGE_HOSTS = new Set([
  'skyonline99.com',
  'www.skyonline99.com',
  'member.skyonline99.com',
]);

const EXPECTED_COLUMNS = [
  'id', 'name', 'description', 'price', 'image_url', 'category', 'stock',
  'is_featured', 'created_at', 'brand', 'pv', 'full_description',
];

function findPgRestore() {
  const candidates = [
    'pg_restore',
    '/opt/homebrew/opt/postgresql@17/bin/pg_restore',
    '/opt/homebrew/bin/pg_restore',
  ];

  for (const command of candidates) {
    const result = spawnSync(command, ['--version'], { encoding: 'utf8' });
    if (!result.error && result.status === 0) return command;
  }
  throw new Error('ไม่พบ pg_restore ในเครื่อง');
}

function decodeCopyValue(value) {
  if (value === '\\N') return null;

  return value.replace(/\\(?:x([0-9a-fA-F]{2})|([0-7]{1,3})|(.))/g, (_, hex, octal, escaped) => {
    if (hex) return String.fromCharCode(parseInt(hex, 16));
    if (octal) return String.fromCharCode(parseInt(octal, 8));
    const replacements = {
      b: '\b', f: '\f', n: '\n', r: '\r', t: '\t', v: '\v', '\\': '\\',
    };
    return replacements[escaped] ?? escaped;
  });
}

function readProductsFromBackup() {
  if (!fs.existsSync(BACKUP_PATH)) throw new Error(`ไม่พบ backup: ${BACKUP_PATH}`);

  const command = findPgRestore();
  const result = spawnSync(command, ['-a', '-t', 'products', '-f', '-', BACKUP_PATH], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(result.stderr || 'pg_restore ทำงานไม่สำเร็จ');

  const lines = result.stdout.split(/\r?\n/);
  const copyIndex = lines.findIndex((line) => line.startsWith('COPY public.products ('));
  if (copyIndex === -1) throw new Error('ไม่พบข้อมูล products ใน backup');

  const columnMatch = lines[copyIndex].match(/^COPY public\.products \((.+)\) FROM stdin;$/);
  const columns = columnMatch?.[1].split(', ').map((column) => column.trim());
  if (!columns || EXPECTED_COLUMNS.some((column, index) => columns[index] !== column)) {
    throw new Error(`รูปแบบคอลัมน์ products ใน backup ไม่ตรงกับที่รองรับ: ${columns?.join(', ')}`);
  }

  const rows = [];
  for (let index = copyIndex + 1; index < lines.length && lines[index] !== '\\.'; index += 1) {
    if (!lines[index]) continue;
    const values = lines[index].split('\t').map(decodeCopyValue);
    if (values.length !== columns.length) {
      throw new Error(`ข้อมูลสินค้าแถวที่ ${index + 1} มีจำนวนคอลัมน์ไม่ถูกต้อง`);
    }
    rows.push(Object.fromEntries(columns.map((column, valueIndex) => [column, values[valueIndex]])));
  }

  if (rows.length === 0) throw new Error('backup ไม่มีรายการสินค้า');
  return rows;
}

function validateImageUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !ALLOWED_IMAGE_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error(`ไม่อนุญาต URL รูป: ${value}`);
  }
  return url;
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 70) || 'product';
}

function imageExtension(contentType, sourceUrl) {
  const byType = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
  };
  if (byType[contentType]) return byType[contentType];

  const extension = path.extname(new URL(sourceUrl).pathname).toLowerCase();
  if (/^\.(jpe?g|png|webp|gif|avif)$/.test(extension)) {
    return extension === '.jpeg' ? '.jpg' : extension;
  }
  throw new Error(`ชนิดไฟล์รูปไม่รองรับ: ${contentType || sourceUrl}`);
}

async function downloadImage(sourceUrl) {
  let currentUrl = validateImageUrl(sourceUrl).toString();

  for (let redirect = 0; redirect <= 5; redirect += 1) {
    validateImageUrl(currentUrl);
    const response = await fetch(currentUrl, {
      redirect: 'manual',
      headers: { 'User-Agent': 'SkyOnlineProductImporter/1.0' },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error(`redirect ไม่มีปลายทางจาก ${currentUrl}`);
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${currentUrl}`);
    const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    if (!contentType?.startsWith('image/')) throw new Error(`URL ไม่ได้ส่งข้อมูลรูป: ${currentUrl}`);

    const declaredSize = Number(response.headers.get('content-length') || 0);
    if (declaredSize > MAX_IMAGE_BYTES) throw new Error(`รูปใหญ่เกิน 15 MB: ${currentUrl}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_IMAGE_BYTES) throw new Error(`รูปใหญ่เกิน 15 MB: ${currentUrl}`);
    return { buffer, contentType, finalUrl: currentUrl };
  }

  throw new Error(`redirect มากเกินไป: ${sourceUrl}`);
}

async function downloadProductImages(products) {
  await fsp.mkdir(OUTPUT_DIR, { recursive: true });
  const prepared = [];

  for (const [index, product] of products.entries()) {
    if (!product.image_url) throw new Error(`สินค้า ${product.id} ไม่มี image_url ใน backup`);
    process.stdout.write(`[${index + 1}/${products.length}] ${product.name} ... `);

    const image = await downloadImage(product.image_url);
    const filename = `${product.id}-${slugify(product.name)}${imageExtension(image.contentType, image.finalUrl)}`;
    const destination = path.join(OUTPUT_DIR, filename);
    const publicPath = `/imported/products/${filename}`;
    await fsp.writeFile(destination, image.buffer);
    prepared.push({ ...product, image_url: publicPath });
    console.log('สำเร็จ');
  }

  return prepared;
}

async function replaceRailwayProducts(products) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS full_description TEXT');
    await client.query('TRUNCATE TABLE products RESTART IDENTITY');

    for (const product of products) {
      await client.query(
        `INSERT INTO products
          (id, name, description, price, image_url, category, stock, is_featured,
           created_at, brand, pv, full_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          Number(product.id), product.name, product.description, product.price,
          product.image_url, product.category, Number(product.stock),
          product.is_featured === 't', product.created_at, product.brand,
          Number(product.pv), product.full_description,
        ]
      );
    }

    await client.query(
      `SELECT setval(
         pg_get_serial_sequence('products', 'id'),
         (SELECT MAX(id) FROM products),
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
  console.log('อ่านสินค้าจาก local backup...');
  const products = readProductsFromBackup();
  console.log(`พบ ${products.length} สินค้า กำลังดาวน์โหลดรูป...`);
  const prepared = await downloadProductImages(products);
  console.log('ดาวน์โหลดครบ กำลังแทนข้อมูล products ใน Railway...');
  await replaceRailwayProducts(prepared);
  console.log(`เสร็จสมบูรณ์: คืนสินค้าเดิม ${prepared.length} รายการพร้อมรูป local ครบ`);
}

main()
  .catch((error) => {
    console.error('กู้คืนสินค้าไม่สำเร็จ:', error.stack || error.message || error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
