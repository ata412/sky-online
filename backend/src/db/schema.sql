CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  brand VARCHAR(100) DEFAULT 'BRAND LUCK',
  pv INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(50) UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  discount_percent INTEGER,
  original_price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  pv INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true
);

CREATE TYPE hall_of_fame_level AS ENUM (
  'Sky Star',
  'Super Star',
  'Manager',
  'Director',
  'Vice President',
  'President',
  'Diamond',
  'Red Diamond',
  'Black Diamond',
  'Blue Diamond',
  'Crown Diamond'
);

CREATE TABLE IF NOT EXISTS hall_of_fame (
  id SERIAL PRIMARY KEY,
  level hall_of_fame_level NOT NULL,
  image_url VARCHAR(500) NOT NULL
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  activity_date DATE,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_photos (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  member_code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  birth_date DATE,
  province VARCHAR(100),
  address TEXT,
  referrer_code VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  total_pv INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_code VARCHAR(20) UNIQUE NOT NULL,
  member_id INTEGER REFERENCES members(id),
  member_code VARCHAR(20),
  total_amount DECIMAL(10, 2) NOT NULL,
  total_pv INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  product_name VARCHAR(255),
  price DECIMAL(10, 2),
  quantity INTEGER,
  subtotal DECIMAL(10, 2),
  pv INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contact_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

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
