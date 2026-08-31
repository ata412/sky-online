require('dotenv').config();
const pool = require('../db');
const {
  CATEGORY_TRANSLATIONS,
  EXPECTED_PRODUCT_NAMES,
  PRODUCT_CATEGORY_BY_ID,
} = require('../lib/productCategories');

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ids = Object.keys(PRODUCT_CATEGORY_BY_ID).map(Number);
    const existing = await client.query(
      'SELECT id, name FROM products WHERE id = ANY($1::int[]) ORDER BY id',
      [ids]
    );

    const namesById = new Map(existing.rows.map((product) => [Number(product.id), product.name]));
    const mismatches = ids.filter((id) => namesById.get(id) !== EXPECTED_PRODUCT_NAMES[id]);
    if (mismatches.length > 0) {
      throw new Error(`ข้อมูลสินค้าไม่ตรงกับ mapping ที่ตรวจสอบไว้: ${mismatches.join(', ')}`);
    }

    const productParams = [];
    const productValues = ids.map((id, index) => {
      productParams.push(id, PRODUCT_CATEGORY_BY_ID[id]);
      return `($${index * 2 + 1}::int, $${index * 2 + 2}::text)`;
    });
    await client.query(
      `UPDATE products AS product
       SET category = mapped.category
       FROM (VALUES ${productValues.join(', ')}) AS mapped(id, category)
       WHERE product.id = mapped.id`,
      productParams
    );

    const translationParams = [];
    const translationValues = [];
    ids.forEach((id) => {
      const category = PRODUCT_CATEGORY_BY_ID[id];
      Object.entries(CATEGORY_TRANSLATIONS).forEach(([locale, translations]) => {
        const offset = translationParams.length;
        translationParams.push(id, locale, translations[category]);
        translationValues.push(
          `($${offset + 1}::int, $${offset + 2}::text, $${offset + 3}::text)`
        );
      });
    });
    await client.query(
      `UPDATE product_translations AS translation
       SET category = mapped.category, updated_at = NOW()
       FROM (VALUES ${translationValues.join(', ')}) AS mapped(product_id, locale, category)
       WHERE translation.product_id = mapped.product_id
         AND translation.locale = mapped.locale`,
      translationParams
    );

    await client.query('COMMIT');
    console.log(`จัดหมวดหมู่สินค้าใหม่สำเร็จ ${ids.length} รายการ`);
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
      console.error('จัดหมวดหมู่สินค้าไม่สำเร็จ:', error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { CATEGORY_TRANSLATIONS };
