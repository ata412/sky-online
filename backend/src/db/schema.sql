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
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  discount_percent INTEGER,
  original_price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true
);

CREATE TYPE hall_of_fame_level AS ENUM (
  'Sky Star',
  'Super Star',
  'Manager Director',
  'Vice President',
  'President Black',
  'Diamond Blue',
  'Diamond Crown',
  'Diamond'
);

CREATE TABLE IF NOT EXISTS hall_of_fame (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  level hall_of_fame_level NOT NULL,
  image_url VARCHAR(500),
  description TEXT,
  achievement TEXT,
  month VARCHAR(20),
  year INTEGER
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
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
