require('dotenv').config();
const pool = require('../db');

const productFdaNumbers = [
  [9, 'Luck Fiber Pineapple', '13-2-05465-6-0295'],
  [10, 'Luck Coffee Plus', '13-2-05465-6-0278'],
  [11, 'Dark Chocolate Flavour', '13-2-05465-6-0233'],
  [12, 'Corn Milk Flavour', '13-2-05465-6-0232'],
  [13, 'Stamp Choice', '13-2-05465-5-0007'],
  [14, 'Sky Wonder', '13-2-05465-5-0035'],
  [15, 'Sky Tok', '13-2-05465-5-0012'],
  [16, 'Sky S', '13-2-05465-5-0013'],
  [17, 'SD Coffee', '13-2-05465-6-0120'],
  [18, 'SD Collagen Gluta VitC', '13-2-05465-6-0117'],
  [19, 'SD Fiber Vegetables Mixed Fruit', '13-2-05465-6-0116'],
  [20, 'Luck Black Coffee 30', '13-2-05465-6-0047'],
  [21, 'Luck Instant Coffee Mix', '13-2-05465-6-0006'],
  [22, 'Orange Collagen', '13-2-05465-6-0162'],
  [23, 'Blue Hawaii Collagen', '13-2-05465-6-0163'],
  [24, 'Lychee Collagen', '13-2-05465-6-0161'],
  [25, 'Apple Collagen', '13-2-05465-6-0160'],
  [26, 'Luck Veggie Mixed', '13-2-05465-6-0040'],
  [27, 'Luck Cocoa', '13-2-05465-6-0039'],
  [28, 'Luck Thai Tea', '13-2-05465-6-0043'],
  [29, 'Matcha Green Tea', '13-2-05465-6-0003'],
  [30, 'Luck Coffee', '13-2-05465-6-0006'],
  [31, 'Luck Black Coffee', '13-2-05465-6-0047'],
  [32, 'Weeda-F', '13-2-00759-1-0013'],
  [33, 'Maya Plus', '13-2-05465-5-0017'],
  [34, 'Ploy Deang', '13-2-05465-5-0021'],
  [35, 'Max Man Coffee', '13-2-05465-6-0077'],
  [36, 'Sky 6 Mix Oil', '13-2-05465-5-0028'],
  [37, 'Sky Lutein', '13-2-05465-5-0015'],
  [38, 'Houluk Seam', '13-2-05465-5-0018'],
];

const FDA_PATTERN = /\b\d{2}-\d-\d{5}-\d-\d{4}\b/g;

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ids = productFdaNumbers.map(([id]) => id);
    const result = await client.query(
      `SELECT id, name, full_description
       FROM products
       WHERE id = ANY($1::int[])
       FOR UPDATE`,
      [ids]
    );
    const products = new Map(result.rows.map((product) => [product.id, product]));
    if (products.size !== productFdaNumbers.length) {
      const missing = ids.filter((id) => !products.has(id));
      throw new Error(`ไม่พบสินค้า ID: ${missing.join(', ')}`);
    }

    const changedIds = [];
    for (const [id, expectedName, fdaNumber] of productFdaNumbers) {
      const product = products.get(id);
      if (product.name !== expectedName) {
        throw new Error(`สินค้า ID ${id} ชื่อไม่ตรง: ${product.name} != ${expectedName}`);
      }

      const currentNumbers = [...new Set(
        String(product.full_description || '').match(FDA_PATTERN) || []
      )];
      if (currentNumbers.includes(fdaNumber)) continue;
      if (currentNumbers.length > 0) {
        throw new Error(
          `${expectedName} มีเลข อย. ${currentNumbers.join(', ')} แต่คาดว่าเป็น ${fdaNumber}`
        );
      }

      const fullDescription = String(product.full_description || '').trim();
      await client.query(
        `UPDATE products
         SET full_description = $2
         WHERE id = $1`,
        [id, `${fullDescription}\nเลขที่ อย. ${fdaNumber}`.trim()]
      );
      changedIds.push(id);
    }

    if (changedIds.length > 0) {
      await client.query(
        'DELETE FROM product_translations WHERE product_id = ANY($1::int[])',
        [changedIds]
      );
    }

    await client.query('COMMIT');
    console.log(
      `ตรวจเลข อย. ${productFdaNumbers.length} รายการสำเร็จ ` +
      `(เพิ่มใหม่ ${changedIds.length} รายการ)`
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
      console.error('อัปเดตเลข อย. ไม่สำเร็จ:', error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { FDA_PATTERN, productFdaNumbers };
