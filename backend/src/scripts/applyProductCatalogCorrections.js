require('dotenv').config();
const pool = require('../db');
const { EXPECTED_PRODUCT_NAMES, PRODUCT_CATEGORY_BY_ID } = require('../lib/productCategories');
const { deduplicateDescriptionLines, productDescription } = require('../lib/productDescriptions');

const OFFICIAL_PRODUCT_PAGES = Object.freeze({
  9: 'LuckFiber',
  10: 'LuckCoffeePlus',
  11: 'DarkChocolate',
  12: 'CornMilk',
  13: 'StampChoice',
  14: 'SkyWonder',
  15: 'SkyTok',
  16: 'SkyS',
  17: 'sdCoffee',
  18: 'sdCollagen',
  19: 'sdFiber',
});

const ACCEPTED_OLD_NAMES = Object.freeze({
  20: 'Luck Black Coffee 30',
  30: 'Luck Coffee',
});

function decodeHtml(value) {
  return String(value)
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function extractOfficialDescription(html, productId) {
  const match = String(html).match(/<h1[^>]*>([\s\S]*?)<div[^>]*>\s*share\s*:/i);
  if (!match) throw new Error(`อ่านรายละเอียดสินค้าทางการ ID ${productId} ไม่สำเร็จ`);

  const description = decodeHtml(match[1])
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/h[1-6]\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');

  if (!/ส่วนประกอบ/.test(description)) {
    throw new Error(`รายละเอียดสินค้าทางการ ID ${productId} ไม่มีส่วนประกอบ`);
  }
  return description;
}

async function fetchOfficialDescriptions() {
  const descriptions = new Map();
  for (const [idText, page] of Object.entries(OFFICIAL_PRODUCT_PAGES)) {
    const id = Number(idText);
    const url = `https://skyonline99.com/product.php?pd=${encodeURIComponent(page)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SkyOnlineCatalogUpdater/1.0' },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`โหลดหน้าสินค้า ID ${id} ไม่สำเร็จ: HTTP ${response.status}`);
    descriptions.set(id, extractOfficialDescription(await response.text(), id));
  }
  return descriptions;
}

function stripEmbeddedPrices(value) {
  return String(value || '')
    .split('\n')
    .filter((line) => !/^\s*(?:👉\s*)?(?:ราคา(?:ปกติ|สมาชิก)?|ปลีก|สมาชิก)\s*:?\s*[\d,]/i.test(line))
    .join('\n');
}

function normalizeKnownTypos(id, value) {
  let description = String(value || '').replace(/นํ้า/g, 'น้ำ');
  const replacements = {
    10: [
      ['วัตถุดิบระดับพรีเมี่ยม', 'วัตถุดิบระดับพรีเมียม'],
      ['กาแฟอาราบิก้า', 'กาแฟอาราบิกา'],
      ['PRUNE POWDER ()', 'PRUNE POWDER (ผงลูกพรุน)'],
      ['(นื้อผล)', '(เนื้อผล)'],
      ['ผงกับทิม', 'ผงทับทิม'],
      ['ผล็ด', 'เมล็ด'],
      ['(LYCOPERSICON ESCULENTUM MILL) wa', '(LYCOPERSICON ESCULENTUM MILL) ผล'],
      ['ผIVaกยอ', 'ผงลูกยอ'],
    ],
    13: [
      ['ประโยน์', 'ประโยชน์'],
      ['บร็อคโคลี่', 'บร็อกโคลี'],
      ['ปฏิกริยา', 'ปฏิกิริยา'],
    ],
    17: [
      ['กาแฟอาราบิก้า', 'กาแฟอาราบิกา'],
      ['รสชาติที่อร่อ', 'รสชาติที่อร่อย'],
    ],
    18: [['ช่วยแลผิวพรรณ', 'ช่วยดูแลผิวพรรณ']],
    19: [['ผงกระเพรา', 'ผงกะเพรา']],
  };
  for (const [from, to] of replacements[id] || []) description = description.replaceAll(from, to);
  return description;
}

function replaceIngredientSection(targetValue, sourceValue) {
  const target = String(targetValue || '').split('\n');
  const source = String(sourceValue || '').split('\n');
  const startPattern = /ส่วนประกอบ/;
  const endPattern = /(?:ใบอนุญาต|เลข(?:ที่)?\s*อย\.?|ขนาดบรรจุ|วิธีรับประทาน)/i;
  const targetStart = target.findIndex((line) => startPattern.test(line));
  const sourceStart = source.findIndex((line) => startPattern.test(line));
  const targetEnd = target.findIndex((line, index) => index > targetStart && endPattern.test(line));
  const sourceEnd = source.findIndex((line, index) => index > sourceStart && endPattern.test(line));

  if ([targetStart, sourceStart, targetEnd, sourceEnd].some((index) => index < 0)) {
    throw new Error('ไม่พบขอบเขตส่วนประกอบของ LUCK Coffee 40 in 1');
  }
  return [
    ...target.slice(0, targetStart),
    ...source.slice(sourceStart, sourceEnd),
    ...target.slice(targetEnd),
  ].join('\n');
}

function removeAppleRepeatedBenefits(value) {
  const lines = String(value || '').split('\n');
  const noTransfat = lines.findIndex((line) => /^No Transfat$/i.test(line.trim()));
  const ingredients = lines.findIndex((line, index) => index > noTransfat && /ส่วนประกอบ/.test(line));
  if (noTransfat >= 0 && ingredients > noTransfat + 1) {
    lines.splice(noTransfat + 1, ingredients - noTransfat - 1);
  }

  const ingredientIndex = lines.findIndex((line) => /ส่วนประกอบ/.test(line));
  const endIndex = lines.findIndex(
    (line, index) => index > ingredientIndex && /(?:ใบอนุญาต|เลข(?:ที่)?\s*อย\.?|ขนาดบรรจุ|วิธีรับประทาน)/i.test(line)
  );
  const hasRaspberry = lines.some((line, index) => (
    index > ingredientIndex && (endIndex < 0 || index < endIndex) && /ราส.*เบอ/i.test(line)
  ));
  if (!hasRaspberry && ingredientIndex >= 0) {
    const blueberryIndex = lines.findIndex(
      (line, index) => index > ingredientIndex && /บลูเบอร์รี|บลูเบอรี่/i.test(line)
    );
    lines.splice(blueberryIndex >= 0 ? blueberryIndex : ingredientIndex + 1, 0, '✅ผงราสเบอรี่');
  }
  return lines.join('\n');
}

function applyManualCorrections(id, value, productsById) {
  let description = normalizeKnownTypos(id, value).replace(/\r/g, '');

  if (id === 20) {
    description = description
      .split('\n')
      .filter((line) => !/คอลลาเจน/i.test(line))
      .join('\n');
  }
  if (id === 23) {
    description = description
      .split('\n')
      .filter((line) => line.trim() !== 'คอลลาเจนลัคซ์ บลูฮาวาย')
      .join('\n');
  }
  if (id === 25) description = removeAppleRepeatedBenefits(description);
  if (id === 26) {
    description = description
      .replace(/อินูลิน/g, 'อินนูลิน')
      .replace(/ผงอาติโช๊ค/g, 'อาติโชค')
      .replace(/ผงบรอกโคลี/g, 'ผงบร็อกโคลี')
      .replace(/ผงออริกาโน่/g, 'ผงออริกาโน');
  }
  if (id === 27 && !/มีผงโกโก้เป็นส่วนประกอบ/.test(description)) {
    const lines = description.split('\n');
    const insertAt = Math.min(3, lines.length);
    lines.splice(
      insertAt,
      0,
      'เครื่องดื่มโกโก้ปรุงสำเร็จชนิดผง มีผงโกโก้เป็นส่วนประกอบ ให้กลิ่นและรสโกโก้เข้มข้น'
    );
    description = lines.join('\n');
  }
  if (id === 28 || id === 29) description = description.replace(/อินูลิน/g, 'อินนูลิน');
  if (id === 30) {
    description = replaceIngredientSection(description, productsById.get(21).full_description);
  }
  if (id === 38 && !/ผลิตภัณฑ์เสริมอาหาร/.test(description)) {
    const lines = description.split('\n');
    lines.splice(Math.min(2, lines.length), 0, '• ผลิตภัณฑ์เสริมอาหาร ชนิดแคปซูล');
    description = lines.join('\n');
  }

  return deduplicateDescriptionLines(stripEmbeddedPrices(description));
}

async function main() {
  console.log('กำลังอ่านส่วนประกอบจากหน้าสินค้าทางการ...');
  const officialDescriptions = await fetchOfficialDescriptions();
  const ids = Object.keys(EXPECTED_PRODUCT_NAMES).map(Number);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT id, name, description, full_description
       FROM products
       WHERE id = ANY($1::int[])
       ORDER BY id
       FOR UPDATE`,
      [ids]
    );
    const productsById = new Map(result.rows.map((product) => [Number(product.id), product]));
    const mismatches = ids.filter((id) => {
      const actual = productsById.get(id)?.name;
      return actual !== EXPECTED_PRODUCT_NAMES[id] && actual !== ACCEPTED_OLD_NAMES[id];
    });
    if (mismatches.length > 0) {
      throw new Error(`ข้อมูลสินค้าไม่ตรงกับรายการที่ตรวจสอบไว้: ${mismatches.join(', ')}`);
    }

    for (const id of ids) {
      const product = productsById.get(id);
      const sourceDescription = officialDescriptions.get(id) || product.full_description;
      const fullDescription = applyManualCorrections(id, sourceDescription, productsById);
      await client.query(
        `UPDATE products
         SET name = $2, category = $3, description = $4, full_description = $5
         WHERE id = $1`,
        [
          id,
          EXPECTED_PRODUCT_NAMES[id],
          PRODUCT_CATEGORY_BY_ID[id],
          productDescription(product),
          fullDescription,
        ]
      );
    }

    await client.query('DELETE FROM product_translations WHERE product_id = ANY($1::int[])', [ids]);
    await client.query('COMMIT');
    console.log(`ปรับชื่อ หมวดหมู่ และรายละเอียดสินค้า ${ids.length} รายการสำเร็จ`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('ปรับรายการสินค้าไม่สำเร็จ:', error.stack || error.message || error);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = {
  applyManualCorrections,
  extractOfficialDescription,
  removeAppleRepeatedBenefits,
  replaceIngredientSection,
  stripEmbeddedPrices,
  normalizeKnownTypos,
};
