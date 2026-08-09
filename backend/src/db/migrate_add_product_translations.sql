CREATE TABLE IF NOT EXISTS product_translations (
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  full_description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (product_id, locale),
  CONSTRAINT product_translations_locale_check
    CHECK (locale IN ('en', 'zh', 'lo', 'my', 'vi'))
);
