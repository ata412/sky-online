CREATE TABLE IF NOT EXISTS image_generation_jobs (
  id BIGSERIAL PRIMARY KEY,
  public_id UUID UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'processing',
  prompt TEXT NOT NULL,
  image_data BYTEA,
  image_mime_type VARCHAR(32),
  error_message TEXT,
  error_code VARCHAR(64),
  requester_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_generation_jobs_requester_created
  ON image_generation_jobs (requester_hash, created_at DESC);
