require('dotenv').config();
const pool = require('../db');

const corrections = [
  [10, 'full_description', 'วัตถุดิบระดับพรีเมี่ยม', 'วัตถุดิบระดับพรีเมียม'],
  [10, 'full_description', 'กาแฟอาราบิก้าแท้', 'กาแฟอาราบิกาแท้'],
  [10, 'full_description', 'กลมกล่อมจากอาราบิก้าแท้', 'กลมกล่อมจากอาราบิกาแท้'],
  [15, 'full_description', 'สกาย ท๊อกซ์', 'สกาย ท็อกซ์'],
  [20, 'full_description', 'ผงไซเลียมฮักค์', 'ผงไซเลียมฮัสก์'],
  [20, 'full_description', 'ผงกาแฟอาราบิก้า', 'ผงกาแฟอาราบิกา'],
  [21, 'full_description', 'ผงทับทีม', 'ผงทับทิม'],
  [21, 'full_description', 'ผงฟรุคโตโอลิโกแซ็กคาไรด์', 'ผงฟรุกโตโอลิโกแซ็กคาไรด์'],
  [21, 'full_description', 'กาแฟอาราบิก้า', 'กาแฟอาราบิกา'],
  [22, 'full_description', 'ช่วยแลผิวพรรณ', 'ช่วยดูแลผิวพรรณ'],
  [22, 'full_description', 'คอลลาเจนไดเปปไทด์จากลา', 'คอลลาเจนไดเปปไทด์จากปลา'],
  [22, 'full_description', 'เด็กโดรส', 'เดกซ์โทรส'],
  [23, 'full_description', 'ช่วยแลผิวพรรณ', 'ช่วยดูแลผิวพรรณ'],
  [23, 'full_description', 'คอลลาเจนเปปไทด์จากลาทะเล', 'คอลลาเจนเปปไทด์จากปลาทะเล'],
  [23, 'full_description', 'ฟองน้ำสับปะรด', 'ผงน้ำสับปะรด'],
  [23, 'full_description', 'เบต้าร์แคโรทีน', 'เบต้าแคโรทีน'],
  [23, 'full_description', 'ผงฟลุกโตรโอลิโกแซ็กคาไรด์', 'ผงฟรุกโตโอลิโกแซ็กคาไรด์'],
  [24, 'full_description', 'ช่วยแลผิวพรรณ', 'ช่วยดูแลผิวพรรณ'],
  [24, 'full_description', 'เมื่อเราดื่มคอลลาเจนเป็นประจำv', 'เมื่อเราดื่มคอลลาเจนเป็นประจำ'],
  [24, 'full_description', 'คอลลาเจนไดเปปไทด์ จากลา', 'คอลลาเจนไดเปปไทด์ จากปลา'],
  [24, 'full_description', 'เด็กโดรส', 'เดกซ์โทรส'],
  [24, 'full_description', 'ผงราสพ์เบอรี่', 'ผงราสป์เบอร์รี'],
  [25, 'full_description', 'ช่วยแลผิวพรรณ', 'ช่วยดูแลผิวพรรณ'],
  [25, 'full_description', 'คอลลาเจนไดเปปไทด์จากลา', 'คอลลาเจนไดเปปไทด์จากปลา'],
  [25, 'full_description', 'เด็กโดรส', 'เดกซ์โทรส'],
  [26, 'full_description', 'ผมบล็อกโคลี่', 'ผงบรอกโคลี'],
  [26, 'full_description', 'ผงน้ำบาร์เซโลน่าเชอร์รี่', 'ผงน้ำอะเซโรลาเชอร์รี'],
  [26, 'full_description', 'ลัคซ์ เวจจี้ มิ๊ก', 'ลัคซ์ เวจจี้ มิกซ์'],
  [27, 'full_description', 'ผมอะโวคาโด', 'ผงอะโวคาโด'],
  [27, 'full_description', 'เวย์โปรตีนไฮโซเลท', 'เวย์โปรตีนไอโซเลท'],
  [28, 'full_description', 'ปรุงส าเร็จ', 'ปรุงสำเร็จ'],
  [28, 'full_description', 'โครเมี่ยม พิโอลิเนต', 'โครเมียม พิโคลิเนต'],
  [28, 'full_description', 'ร้านสกัดจากโสม', 'สารสกัดจากโสม'],
  [28, 'full_description', 'เวย์โปรตีนไอโซเลค', 'เวย์โปรตีนไอโซเลท'],
  [29, 'full_description', 'โครเมี่ยม พิโอลิเนต', 'โครเมียม พิโคลิเนต'],
  [29, 'full_description', 'เวย์โปรตีนไอโซเลค', 'เวย์โปรตีนไอโซเลท'],
  [30, 'full_description', 'ผงกาแฟอาราบิก้า', 'ผงกาแฟอาราบิกา'],
  [30, 'full_description', 'สารสกัดจากบาร์เซโลน่าเชอร์รี่', 'สารสกัดจากอะเซโรลาเชอร์รี'],
  [31, 'full_description', 'No Transfat0', 'No Transfat'],
  [31, 'full_description', 'ผมฟรุตโตโอลิโกแซ็กคาไรด์', 'ผงฟรุกโตโอลิโกแซ็กคาไรด์'],
  [31, 'full_description', 'ผงไซเลียมฮักค์', 'ผงไซเลียมฮัสก์'],
  [31, 'full_description', 'ผงกาแฟอาราบิก้า', 'ผงกาแฟอาราบิกา'],
  [32, 'full_description', 'สารสดัดเห็ดหลินจือ', 'สารสกัดเห็ดหลินจือ'],
  [32, 'full_description', 'ซิงค์อะมิโน แอซิด คลีเลต', 'ซิงค์อะมิโน แอซิด คีเลต'],
  [35, 'full_description', 'ชงละลายน้ำร้อน 100 มิลลิกรัม', 'ชงละลายน้ำร้อน 100 มิลลิลิตร'],
  [35, 'full_description', 'ผงกาแฟอาราบิก้า', 'ผงกาแฟอาราบิกา'],
  [36, 'full_description', 'หนังศรีษะ', 'หนังศีรษะ'],
  [37, 'description', 'สายตาฟ่าฟาง', 'สายตาฝ้าฟาง'],
  [37, 'full_description', 'สายตาฟ่าฟาง', 'สายตาฝ้าฟาง'],
  [37, 'full_description', 'ชิตัส ไบโอฟลาโวนอยด์', 'ซิตรัส ไบโอฟลาโวนอยด์'],
  [37, 'full_description', 'ไพรีดอกซิ ไฮโดรคลอไรด์', 'ไพริดอกซีน ไฮโดรคลอไรด์'],
  [37, 'full_description', 'ไรโนฟลาวิน', 'ไรโบฟลาวิน'],
  [37, 'full_description', 'อื่นๆ.', 'อื่น ๆ'],
  [37, 'full_description', '600มิลลิกรัม', '600 มิลลิกรัม'],
  [38, 'full_description', 'สีนํ้าตาล', 'สีน้ำตาล'],
  [38, 'full_description', 'บำรุงร่ายกาย', 'บำรุงร่างกาย'],
];

function replaceExactlyOnce(value, from, to, label) {
  const text = String(value || '');
  const occurrences = text.split(from).length - 1;
  if (occurrences === 1) return text.replace(from, to);
  if (occurrences === 0 && text.includes(to)) return text;
  throw new Error(`${label}: expected one occurrence of "${from}", found ${occurrences}`);
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const productIds = [...new Set(corrections.map(([id]) => id))];
    const result = await client.query(
      `SELECT id, name, description, full_description
       FROM products
       WHERE id = ANY($1::int[])
       FOR UPDATE`,
      [productIds]
    );
    const products = new Map(result.rows.map((product) => [product.id, product]));

    if (products.size !== productIds.length) {
      const missing = productIds.filter((id) => !products.has(id));
      throw new Error(`ไม่พบสินค้า ID: ${missing.join(', ')}`);
    }

    let changedCount = 0;
    const changedProductIds = new Set();
    for (const [id, field, from, to] of corrections) {
      const product = products.get(id);
      const previousValue = product[field];
      product[field] = replaceExactlyOnce(
        product[field],
        from,
        to,
        `สินค้า ${id} ${product.name}.${field}`
      );
      if (product[field] !== previousValue) {
        changedCount += 1;
        changedProductIds.add(id);
      }
    }

    for (const product of products.values()) {
      if (!changedProductIds.has(product.id)) continue;
      await client.query(
        `UPDATE products
         SET description = $2, full_description = $3
         WHERE id = $1`,
        [product.id, product.description, product.full_description]
      );
    }

    if (changedProductIds.size > 0) {
      await client.query(
        'DELETE FROM product_translations WHERE product_id = ANY($1::int[])',
        [[...changedProductIds]]
      );
    }
    await client.query('COMMIT');
    console.log(
      `ตรวจคำสะกด ${corrections.length} จุด ในสินค้า ${productIds.length} รายการสำเร็จ` +
      ` (แก้ใหม่ ${changedCount} จุด)`
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
      console.error('ตรวจแก้คำสะกดสินค้าไม่สำเร็จ:', error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { corrections, replaceExactlyOnce };
