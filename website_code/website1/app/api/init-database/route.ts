import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Initialize Supabase client with server-side credentials
const supabaseAdmin = createServerSupabaseClient()

// SQL schema for the database based on the provided schema diagram
const schema = `
-- Create tables for the Pride Information Management System (PIMS)

-- Languages table
CREATE TABLE IF NOT EXISTS languages (
  language_id SERIAL PRIMARY KEY,
  language_name VARCHAR(255) NOT NULL
);

-- Topics table
CREATE TABLE IF NOT EXISTS topic (
  topic_id SERIAL PRIMARY KEY,
  topic_name VARCHAR(255) NOT NULL
);

-- Topic translations table
CREATE TABLE IF NOT EXISTS topic_translations (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES topic(topic_id),
  language_id INTEGER REFERENCES languages(language_id),
  translated_topic VARCHAR(255) NOT NULL
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  organization_id SERIAL PRIMARY KEY,
  organization_name VARCHAR(255) NOT NULL
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  location_id SERIAL PRIMARY KEY,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL
);

-- PIMS Main table
CREATE TABLE IF NOT EXISTS pims_main (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  organization_id INTEGER REFERENCES organizations(organization_id),
  location_id INTEGER REFERENCES locations(location_id),
  date DATE,
  summary TEXT,
  source_link TEXT,
  has_photos BOOLEAN DEFAULT FALSE,
  type VARCHAR(255)
);

-- PIMS Main translations table
CREATE TABLE IF NOT EXISTS pims_main_translations (
  id SERIAL PRIMARY KEY,
  pims_id INTEGER REFERENCES pims_main(id),
  language_id INTEGER REFERENCES languages(language_id),
  title VARCHAR(255),
  summary TEXT,
  source_link TEXT
);

-- PIMS Entry Topic junction table
CREATE TABLE IF NOT EXISTS pims_entry_topic (
  pims_id INTEGER REFERENCES pims_main(id),
  topic_id INTEGER REFERENCES topic(topic_id),
  PRIMARY KEY (pims_id, topic_id)
);

-- Pride Records table
CREATE TABLE IF NOT EXISTS pride_records (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255),
  city VARCHAR(255),
  province VARCHAR(255),
  date DATE,
  summary TEXT,
  source_link TEXT,
  has_photos BOOLEAN DEFAULT FALSE,
  type VARCHAR(255),
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  pims_id INTEGER REFERENCES pims_main(id)
);

-- Insert sample data for testing

-- Sample languages
INSERT INTO languages (language_name) VALUES
('English'),
('French');

-- Sample topics
INSERT INTO topic (topic_name) VALUES
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

-- Sample topic translations
INSERT INTO topic_translations (topic_id, language_id, translated_topic) VALUES
(1, 2, 'Fierté'),
(2, 2, 'Défilé'),
(3, 2, 'Festival'),
(4, 2, 'Historique'),
(5, 2, 'Activisme'),
(6, 2, 'Droits légaux'),
(7, 2, 'Communauté'),
(8, 2, 'Manifestation'),
(9, 2, 'Célébration'),
(10, 2, 'Éducation');

-- Sample organizations
INSERT INTO organizations (organization_name) VALUES
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
('Regina', 'Saskatchewan'),
('Ottawa', 'Ontario'),
('Calgary', 'Alberta'),
('Winnipeg', 'Manitoba'),
('Victoria', 'British Columbia');

-- Sample PIMS entries
INSERT INTO pims_main (title, organization_id, location_id, date, summary, source_link, has_photos, type) VALUES
('Toronto Pride Parade 1981', 1, 1, '1981-06-28', 'The first official Pride celebration in Toronto, following protests against police raids.', 'https://example.com/toronto-pride-1981', true, 'Event'),
('Montreal Pride Festival 2007', 2, 2, '2007-07-29', 'The first edition of Fierté Montréal, now one of the largest Pride celebrations in the Francophone world.', 'https://example.com/montreal-pride-2007', true, 'Event'),
('Vancouver Pride Society Formation', 3, 3, '1978-08-05', 'The formation of the Vancouver Pride Society to organize Pride events in Vancouver.', 'https://example.com/vancouver-pride-society', false, 'Organization'),
('Halifax Pride 1988', 4, 4, '1988-07-19', 'Early Pride celebrations in Halifax, one of the oldest Pride events in Atlantic Canada.', 'https://example.com/halifax-pride-1988', true, 'Event'),
('Edmonton Pride Festival Cancellation', 5, 5, '2019-04-10', 'Edmonton Pride Festival was cancelled in 2019 due to internal conflicts and demands from QTBIPOC groups for greater inclusion and representation.', 'https://example.com/edmonton-pride-2019', false, 'News'),
('Regina Pride History', 6, 6, '1990-06-15', 'Regina has been hosting Pride events since 1990, with the first official Pride parade taking place in 1993.', 'https://example.com/regina-pride-history', true, 'Historical'),
('Ottawa Pride 2000', 1, 7, '2000-08-27', 'Ottawa Pride celebration in 2000, marking a significant growth in attendance.', 'https://example.com/ottawa-pride-2000', true, 'Event'),
('Calgary Pride Week 2010', 1, 8, '2010-09-03', 'Calgary Pride Week featuring multiple events across the city.', 'https://example.com/calgary-pride-2010', true, 'Event'),
('Winnipeg Pride March 1995', 1, 9, '1995-06-04', 'Early Pride march in Winnipeg showing community solidarity.', 'https://example.com/winnipeg-pride-1995', true, 'Event'),
('Victoria Pride Society 20th Anniversary', 3, 10, '2012-07-08', 'Celebrating 20 years of the Victoria Pride Society and its contributions to the community.', 'https://example.com/victoria-pride-20th', true, 'Anniversary');

-- Sample PIMS translations
INSERT INTO pims_main_translations (pims_id, language_id, title, summary) VALUES
(1, 2, 'Défilé de la Fierté de Toronto 1981', 'La première célébration officielle de la Fierté à Toronto, suite aux manifestations contre les descentes policières.'),
(2, 2, 'Festival de la Fierté de Montréal 2007', 'La première édition de Fierté Montréal, maintenant l'une des plus grandes célébrations de la Fierté dans le monde francophone.'),
(3, 2, 'Formation de la Société de la Fierté de Vancouver', 'La formation de la Société de la Fierté de Vancouver pour organiser des événements de la Fierté à Vancouver.'),
(4, 2, 'Fierté de Halifax 1988', 'Premières célébrations de la Fierté à Halifax, l'un des plus anciens événements de la Fierté au Canada atlantique.');

-- Sample PIMS entry topics
INSERT INTO pims_entry_topic (pims_id, topic_id) VALUES
(1, 1), (1, 2), (1, 4), -- Toronto Pride: Pride, Parade, Historical
(2, 1), (2, 3), (2, 9), -- Montreal Pride: Pride, Festival, Celebration
(3, 1), (3, 4), (3, 7), -- Vancouver Pride: Pride, Historical, Community
(4, 1), (4, 4), (4, 9), -- Halifax Pride: Pride, Historical, Celebration
(5, 1), (5, 8), (5, 10), -- Edmonton Pride: Pride, Protest, Education
(6, 1), (6, 4), (6, 7), -- Regina Pride: Pride, Historical, Community
(7, 1), (7, 2), (7, 9), -- Ottawa Pride: Pride, Parade, Celebration
(8, 1), (8, 3), (8, 9), -- Calgary Pride: Pride, Festival, Celebration
(9, 1), (9, 8), (9, 7), -- Winnipeg Pride: Pride, Protest, Community
(10, 1), (10, 4), (10, 9); -- Victoria Pride: Pride, Historical, Celebration

-- Sample Pride Records
INSERT INTO pride_records (title, organization_name, city, province, date, summary, has_photos, type, is_processed, pims_id) VALUES
('Toronto Pride 2022', 'Pride Toronto', 'Toronto', 'Ontario', '2022-06-24', 'Annual Pride celebration in Toronto featuring parade and festival.', true, 'Event', true, 1),
('Montreal Pride 2022', 'Fierté Montréal', 'Montreal', 'Quebec', '2022-08-07', 'Annual Pride celebration in Montreal with cultural events.', true, 'Event', true, 2),
('Vancouver Pride 2022', 'Vancouver Pride Society', 'Vancouver', 'British Columbia', '2022-07-31', 'Vancouver Pride parade and festival celebrating diversity.', true, 'Event', true, 3);
`

export async function GET(request: NextRequest) {
  try {
    console.log("Initializing database...")

    // First, check if tables already exist
    try {
      const { data, error } = await supabaseAdmin.from("pims_main").select("*").limit(1)

      // If we can query the pims_main table and it has data, we might want to avoid reinitializing
      if (!error && data && data.length > 0) {
        console.log("Database already contains data. Skipping initialization.")
        return NextResponse.json({ success: true, message: "Database already initialized" })
      }
    } catch (checkError) {
      // If this fails, it likely means the tables don't exist, so we should proceed with initialization
      console.log("Database tables don't exist yet. Proceeding with initialization.")
    }

    // Split the schema into individual statements
    const statements = schema
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0)

    // Execute each statement
    for (const statement of statements) {
      try {
        const { error } = await supabaseAdmin.rpc("exec_sql", { sql: statement + ";" })

        if (error) {
          console.error(`Error executing SQL statement: ${error.message}`)
          // Continue with other statements even if one fails
        }
      } catch (stmtError) {
        console.error(`Error executing statement: ${stmtError}`)
        // Continue with other statements
      }
    }

    console.log("Database initialization completed successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Database initialization failed:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

