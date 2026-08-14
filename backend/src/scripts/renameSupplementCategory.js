require('dotenv').config();
const pool = require('../db');

const OLD_CATEGORY = 'ความงาม';
const NEW_CATEGORY = 'อาหารเสริม';

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE products
       SET category = $2
       WHERE category = $1
       RETURNING id`,
      [OLD_CATEGORY, NEW_CATEGORY]
    );
    const changedIds = result.rows.map(({ id }) => id);

    if (changedIds.length > 0) {
      await client.query(
        'DELETE FROM product_translations WHERE product_id = ANY($1::int[])',
        [changedIds]
      );
    }

    await client.query('COMMIT');
    console.log(
      `เปลี่ยนหมวด ${OLD_CATEGORY} เป็น ${NEW_CATEGORY} สำเร็จ ` +
      `(${changedIds.length} รายการ)`
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
      console.error('เปลี่ยนชื่อหมวดสินค้าไม่สำเร็จ:', error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { NEW_CATEGORY, OLD_CATEGORY };
