DROP TABLE IF EXISTS hall_of_fame;
DROP TYPE IF EXISTS hall_of_fame_level;

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

CREATE TABLE hall_of_fame (
  id SERIAL PRIMARY KEY,
  level hall_of_fame_level NOT NULL,
  image_url VARCHAR(500) NOT NULL
);
