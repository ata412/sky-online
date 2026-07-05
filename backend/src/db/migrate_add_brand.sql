ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100) DEFAULT 'BRAND LUCK';

-- แบ่งสินค้าเดิมตาม category ลงแต่ละ brand
UPDATE products SET brand = 'BRAND LUCK'         WHERE category IN ('วิตามิน') AND brand IS NULL;
UPDATE products SET brand = 'Dietary Supplement'  WHERE category IN ('โปรตีน', 'ย่อยอาหาร', 'กระดูก') AND brand IS NULL;
UPDATE products SET brand = 'BRAND Houluk Seam'  WHERE category IN ('ความงาม') AND brand IS NULL;

-- fallback สำหรับสินค้าที่ยังไม่มี brand
UPDATE products SET brand = 'BRAND LUCK' WHERE brand IS NULL;
