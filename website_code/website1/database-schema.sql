-- Create tables for the Pride Information Management System (PIMS)

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PIMS Entries table
CREATE TABLE IF NOT EXISTS pims_entries (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  organization_id INTEGER REFERENCES organizations(id),
  location_id INTEGER REFERENCES locations(id),
  date VARCHAR(255),
  summary TEXT,
  source_link VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  pims_entry_id INTEGER REFERENCES pims_entries(id) NOT NULL,
  url VARCHAR(255) NOT NULL,
  source_link VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event Topics junction table
CREATE TABLE IF NOT EXISTS event_topics (
  pims_entry_id INTEGER REFERENCES pims_entries(id) NOT NULL,
  topic_id INTEGER REFERENCES topics(id) NOT NULL,
  PRIMARY KEY (pims_entry_id, topic_id)
);

-- Insert sample data for testing

-- Sample organizations
INSERT INTO organizations (name) VALUES
  ('Pride Toronto'),
  ('Fierté Montréal'),
  ('Vancouver Pride Society'),
  ('Halifax Pride'),
  ('Edmonton Pride Festival Society'),
  ('Queen City Pride');

-- Sample locations
INSERT INTO locations (city, province) VALUES
  ('Toronto', 'Ontario'),
  ('Montreal', 'Quebec'),
  ('Vancouver', 'British Columbia'),
  ('Halifax', 'Nova Scotia'),
  ('Edmonton', 'Alberta'),
  ('Regina', 'Saskatchewan');

-- Sample topics
INSERT INTO topics (name) VALUES
  ('Pride'),
  ('Parade'),
  ('Festival'),
  ('Historical'),
  ('Activism'),
  ('Legal Rights'),
  ('Community'),
  ('Protest'),
  ('Celebration'),
  ('Education');

-- Sample PIMS entries
INSERT INTO pims_entries (title, organization_id, location_id, date, summary, source_link) VALUES
  ('Toronto Pride Parade 1981', 1, 1, 'June 28, 1981', 'The first official Pride celebration in Toronto, following protests against police raids.', 'https://example.com/toronto-pride-1981'),
  ('Montreal Pride Festival 2007', 2, 2, 'July 29, 2007', 'The first edition of Fierté Montréal, now one of the largest Pride celebrations in the Francophone world.', 'https://example.com/montreal-pride-2007'),
  ('Vancouver Pride Society Formation', 3, 3, 'August 5, 1978', 'The formation of the Vancouver Pride Society to organize Pride events in Vancouver.', 'https://example.com/vancouver-pride-society'),
  ('Halifax Pride 1988', 4, 4, 'July 19, 1988', 'Early Pride celebrations in Halifax, one of the oldest Pride events in Atlantic Canada.', 'https://example.com/halifax-pride-1988'),
  ('Edmonton Pride Festival Cancellation', 5, 5, 'April 10, 2019', 'Edmonton Pride Festival was cancelled in 2019 due to internal conflicts and demands from QTBIPOC groups for greater inclusion and representation.', 'https://example.com/edmonton-pride-2019'),
  ('Regina Pride History', 6, 6, 'June 15, 1990', 'Regina has been hosting Pride events since 1990, with the first official Pride parade taking place in 1993.', 'https://example.com/regina-pride-history');

-- Sample images
INSERT INTO images (pims_entry_id, url, source_link) VALUES
  (1, '/placeholder.svg?height=200&width=400&text=Toronto+Pride+1981', 'https://example.com/toronto-pride-1981-image'),
  (2, '/placeholder.svg?height=200&width=400&text=Montreal+Pride+2007', 'https://example.com/montreal-pride-2007-image'),
  (3, '/placeholder.svg?height=200&width=400&text=Vancouver+Pride+Society', 'https://example.com/vancouver-pride-society-image'),
  (4, '/placeholder.svg?height=200&width=400&text=Halifax+Pride+1988', 'https://example.com/halifax-pride-1988-image'),
  (5, '/placeholder.svg?height=200&width=400&text=Edmonton+Pride+2019', 'https://example.com/edmonton-pride-2019-image'),
  (6, '/placeholder.svg?height=200&width=400&text=Regina+Pride+History', 'https://example.com/regina-pride-history-image');

-- Sample event topics
INSERT INTO event_topics (pims_entry_id, topic_id) VALUES
  (1, 1), (1, 2), (1, 4), -- Toronto Pride: Pride, Parade, Historical
  (2, 1), (2, 3), (2, 9), -- Montreal Pride: Pride, Festival, Celebration
  (3, 1), (3, 4), (3, 7), -- Vancouver Pride: Pride, Historical, Community
  (4, 1), (4, 4), (4, 9), -- Halifax Pride: Pride, Historical, Celebration
  (5, 1), (5, 8), (5, 10), -- Edmonton Pride: Pride, Protest, Education
  (6, 1), (6, 4), (6, 7); -- Regina Pride: Pride, Historical, Community

