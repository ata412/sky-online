CREATE TABLE IF NOT EXISTS video_generation_jobs (
  id BIGSERIAL PRIMARY KEY,
  public_id UUID UNIQUE NOT NULL,
  operation_name TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'submitting',
  prompt TEXT NOT NULL,
  video_uri TEXT,
  error_message TEXT,
  requester_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_generation_jobs_requester_created
  ON video_generation_jobs (requester_hash, created_at DESC);
