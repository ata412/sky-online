require('dotenv').config();
const pool = require('../db');
const { EXPECTED_PRODUCT_NAMES } = require('../lib/productCategories');
const {
  PRODUCT_DESCRIPTION_BY_ID,
  deduplicateDescriptionLines,
  productDescription,
} = require('../lib/productDescriptions');

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ids = Object.keys(PRODUCT_DESCRIPTION_BY_ID).map(Number);
    const result = await client.query(
      `SELECT id, name, description, full_description
       FROM products
       WHERE id = ANY($1::int[])
       ORDER BY id
       FOR UPDATE`,
      [ids]
    );

    const productsById = new Map(result.rows.map((product) => [Number(product.id), product]));
    const mismatches = ids.filter((id) => (
      productsById.get(id)?.name !== EXPECTED_PRODUCT_NAMES[id]
    ));
    if (mismatches.length > 0) {
      throw new Error(`ข้อมูลสินค้าไม่ตรงกับรายการที่ตรวจสอบไว้: ${mismatches.join(', ')}`);
    }

    let removedLineCount = 0;
    for (const id of ids) {
      const product = productsById.get(id);
      const fullDescription = deduplicateDescriptionLines(product.full_description);
      removedLineCount += String(product.full_description || '').split(/\r?\n/).length
        - fullDescription.split('\n').length;

      await client.query(
        `UPDATE products
         SET description = $2, full_description = $3
         WHERE id = $1`,
        [id, productDescription(product), fullDescription]
      );
    }

    await client.query(
      'DELETE FROM product_translations WHERE product_id = ANY($1::int[])',
      [ids]
    );
    await client.query('COMMIT');
    console.log(
      `ปรับคำอธิบายสินค้า ${ids.length} รายการ และลบบรรทัดซ้ำ ${removedLineCount} บรรทัดสำเร็จ`
    );
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
      console.error('ปรับคำอธิบายสินค้าไม่สำเร็จ:', error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { main };
