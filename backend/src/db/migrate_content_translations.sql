CREATE TABLE IF NOT EXISTS content_translations (
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('activities', 'promotions')),
  content_id INTEGER NOT NULL,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en', 'zh', 'lo', 'my', 'vi')),
  source_hash CHAR(64) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (content_type, content_id, locale)
);
