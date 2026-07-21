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

const OUTPUT_DIR = path.join(PUBLIC_DIR, 'imported/hall-of-fame/all');
const EXPECTED_COLUMNS = ['id', 'level', 'image_url'];

function filenamePrefix(member) {
  const sourceName = path.basename(new URL(member.image_url).pathname, path.extname(new URL(member.image_url).pathname));
  return `${member.id}-${slugify(member.level)}-${slugify(decodeURIComponent(sourceName))}.`;
}

async function existingFiles() {
  try {
    return await fsp.readdir(OUTPUT_DIR);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function findExistingImage(member, filenames) {
  const prefix = filenamePrefix(member);
  const matches = filenames.filter((filename) => filename.startsWith(prefix));
  if (matches.length > 1) {
    throw new Error(`พบรูปซ้ำ ${matches.length} ไฟล์สำหรับ Hall of Fame id ${member.id}`);
  }
  return matches[0] || null;
}

async function prepareHallImages(members, { dbOnly }) {
  await fsp.mkdir(OUTPUT_DIR, { recursive: true });
  const filenames = await existingFiles();
  const prepared = [];

  for (const [index, member] of members.entries()) {
    const existing = findExistingImage(member, filenames);
    process.stdout.write(`[${index + 1}/${members.length}] ${member.level} #${member.id} ... `);

    if (existing) {
      prepared.push({ ...member, image_url: `/imported/hall-of-fame/all/${existing}` });
      console.log('มีไฟล์แล้ว');
      continue;
    }

    if (dbOnly) {
      throw new Error(`ไม่พบรูปที่ดาวน์โหลดไว้สำหรับ Hall of Fame id ${member.id}`);
    }

    const image = await downloadImage(member.image_url);
    const filename = `${filenamePrefix(member).slice(0, -1)}${imageExtension(image.contentType, image.finalUrl)}`;
    await fsp.writeFile(path.join(OUTPUT_DIR, filename), image.buffer);
    filenames.push(filename);
    prepared.push({ ...member, image_url: `/imported/hall-of-fame/all/${filename}` });
    console.log('ดาวน์โหลดสำเร็จ');
  }

  return prepared;
}

async function replaceRailwayHallOfFame(members) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE hall_of_fame RESTART IDENTITY');

    for (const member of members) {
      await client.query(
        'INSERT INTO hall_of_fame (id, level, image_url) VALUES ($1, $2, $3)',
        [Number(member.id), member.level, member.image_url]
      );
    }

    await client.query(
      `SELECT setval(
         pg_get_serial_sequence('hall_of_fame', 'id'),
         (SELECT MAX(id) FROM hall_of_fame),
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
  console.log('อ่าน Hall of Fame จาก local backup...');
  const members = readTableFromBackup('hall_of_fame', EXPECTED_COLUMNS);
  const dbOnly = process.argv.includes('--db-only');
  const downloadOnly = process.argv.includes('--download-only');
  if (dbOnly && downloadOnly) throw new Error('เลือกได้เพียง --db-only หรือ --download-only อย่างใดอย่างหนึ่ง');
  console.log(`พบ ${members.length} รูป ${dbOnly ? 'กำลังตรวจไฟล์เดิม' : 'กำลังดาวน์โหลด/ตรวจไฟล์เดิม'}...`);
  const prepared = await prepareHallImages(members, { dbOnly });
  if (downloadOnly) {
    console.log(`ดาวน์โหลดเสร็จสมบูรณ์: Hall of Fame ${prepared.length} รูป (ยังไม่ได้แก้ Railway)`);
    return;
  }
  console.log('รูปครบ กำลังแทนข้อมูล hall_of_fame ใน Railway...');
  await replaceRailwayHallOfFame(prepared);
  console.log(`เสร็จสมบูรณ์: คืน Hall of Fame ${prepared.length} รูปพร้อม path local ครบ`);
}

main()
  .catch((error) => {
    console.error('กู้คืน Hall of Fame ไม่สำเร็จ:', error.stack || error.message || error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
