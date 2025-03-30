import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

def create_and_populate_pims_database(csv_file, db_url):
    """
    Reads data from a CSV file and populates the PIMS database tables in Supabase.

    Args:
        csv_file (str): Path to the CSV file.
        db_url (str): PostgreSQL connection URL (from Supabase).
    """
    try:
        # Read the CSV file into a pandas DataFrame (auto-detect delimiter)
        df = pd.read_csv(csv_file, sep=None, engine='python')
        # Limit to first 10 records for testing
        #df = df.head(100)
        print(f"✅ Successfully read data from: {csv_file}")
    except Exception as e:
        print(f"❌ Error reading CSV file: {e}")
        return

    conn = None
    try:
        # Connect to Supabase PostgreSQL database
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        print(f"✅ Connected to database")

        # --- Function to execute queries safely ---
        def execute_query(sql, params=None, fetch=False, many=False):
            try:
                if many:
                    cursor.executemany(sql, params)
                else:
                    cursor.execute(sql, params)

                if fetch:
                    return cursor.fetchall()
            except psycopg2.Error as e:
                conn.rollback()
                print(f"❌ Database error: {e}")
                raise

        # --- Populate organizations table ---
        organizations = df['Organization Name'].dropna().unique()
        execute_values(cursor,
                       "INSERT INTO organizations (organization_name) VALUES %s ON CONFLICT (organization_name) DO NOTHING",
                       [(org,) for org in organizations]
                       )
        print("✅ Organizations table populated.")

        # --- Populate locations table ---
        df['Location'] = df['City'].astype(str) + '|' + df['Province'].astype(str)
        locations = df[['City', 'Province', 'Location']].drop_duplicates(subset=['Location'])

        execute_values(cursor,
                       "INSERT INTO locations (city, province) VALUES %s ON CONFLICT (city, province) DO NOTHING",
                       [(row.City, row.Province) for index, row in locations.iterrows()]
                       )
        print("✅ Locations table populated.")

        # --- Populate topic table ---
        all_topics = set()
        for topics in df['Topics'].dropna():
            if isinstance(topics, str):
                # Remove brackets and split by comma
                cleaned_topics = topics.strip('[]').split(',')
                # Clean each topic and add to set
                for topic in cleaned_topics:
                    cleaned_topic = topic.strip().strip('"\'')  # Remove quotes and whitespace
                    if cleaned_topic:  # Only add non-empty topics
                        all_topics.add(cleaned_topic)

        execute_values(cursor,
                       "INSERT INTO topic (topic_name) VALUES %s ON CONFLICT (topic_name) DO NOTHING",
                       [(topic,) for topic in all_topics]
                       )
        print("✅ Topic table populated.")

        # --- Populate pims_main table ---
        # Dictionary to track unique combinations and keep the entry with the most complete summary
        seen_entries = {}
        csv_id_to_db_id_map = {}

        for index, row in df.iterrows():
            org_name, city, province = row['Organization Name'], str(row['City']), str(row['Province'])

            # Check if org_name is NaN before querying
            if pd.isna(org_name):
                organization_id = None
            else:
                # Get organization_id
                cursor.execute("SELECT organization_id FROM organizations WHERE organization_name = %s", (org_name,))
                organization_id = cursor.fetchone()
                organization_id = organization_id[0] if organization_id else None

            # Get location_id
            cursor.execute("SELECT location_id FROM locations WHERE city = %s AND province = %s", (city, province))
            location_id = cursor.fetchone()
            location_id = location_id[0] if location_id else None

            # Try to convert the 'Date' column to a datetime object, coercing errors to NaT
            date_value = pd.to_datetime(row['Date'], errors='coerce')

            # Handle NaT values (invalid dates)
            if pd.isna(date_value):
                date_to_insert = None
            else:
                date_to_insert = date_value.to_pydatetime()

            # Create a tuple of the values that make up your unique constraint
            key = (row['Title'], organization_id, location_id, date_to_insert)
            
            # Get the summary and source link
            summary = row['Summary'] if pd.notna(row['Summary']) else ""
            source_link = row['Source Link'] if pd.notna(row['Source Link']) else ""
            has_photos = bool(row['Has Photos']) if 'Has Photos' in row and pd.notna(row['Has Photos']) else False
            event_type = row['Event Type'] if 'Event Type' in row and pd.notna(row['Event Type']) else None
            
            # Store the CSV ID for later mapping
            csv_id = row['ID']
            
            # If we've seen this key before, keep the entry with the non-empty summary
            # or the longer summary if both are non-empty
            if key in seen_entries:
                existing_summary, existing_source, existing_has_photos, existing_type, existing_csv_id = seen_entries[key]
                
                # If current summary is empty, keep the existing one
                if not summary:
                    continue
                    
                # If existing summary is empty, replace with current
                if not existing_summary:
                    seen_entries[key] = (summary, source_link, has_photos, event_type, csv_id)
                    
                # If both are non-empty, keep the longer one
                elif len(summary) > len(existing_summary):
                    seen_entries[key] = (summary, source_link, has_photos, event_type, csv_id)
            else:
                # First time seeing this key
                seen_entries[key] = (summary, source_link, has_photos, event_type, csv_id)

        # Now build pims_main_data from the deduplicated entries
        pims_main_data = []
        for key, (summary, source_link, has_photos, event_type, csv_id) in seen_entries.items():
            title, organization_id, location_id, date_to_insert = key
            pims_main_data.append((title, organization_id, location_id, date_to_insert, summary, source_link, has_photos, event_type))

        # Use execute_values with batches
        batch_size = 100
        for i in range(0, len(pims_main_data), batch_size):
            batch = pims_main_data[i:i+batch_size]
            results = execute_values(cursor,
                           """
                           INSERT INTO pims_main (title, organization_id, location_id, date, summary, source_link, has_photos, type)
                           VALUES %s
                           ON CONFLICT (title, organization_id, location_id, date) DO UPDATE SET
                               summary = EXCLUDED.summary,
                               source_link = EXCLUDED.source_link,
                               has_photos = EXCLUDED.has_photos,
                               type = EXCLUDED.type
                           RETURNING id, title, organization_id, location_id, date
                           """,
                           batch,
                           fetch=True
                           )
            # Store the mapping between inserted records and their database IDs
            for record in results:
                db_id, title, org_id, loc_id, date = record
                key = (title, org_id, loc_id, date)
                if key in seen_entries:
                    _, _, _, _, csv_id = seen_entries[key]
                    csv_id_to_db_id_map[csv_id] = db_id

        print("✅ pims_main table populated.")

        # --- Populate pims_entry_topic table ---
        topic_mapping = {}
        cursor.execute("SELECT topic_id, topic_name FROM topic")
        for topic_id, topic_name in cursor.fetchall():
            topic_mapping[topic_name] = topic_id

        print(f"Found {len(topic_mapping)} topics in database")
        print("Sample topics:", list(topic_mapping.keys())[:5])

        # Dictionary to track unique combinations for pims_entry_topic
        seen_topic_entries = set()
        pims_entry_topic_data = []
        
        for index, row in df.iterrows():
            if pd.notna(row['Topics']):
                if isinstance(row['Topics'], str):
                    # Use the same cleaning logic as when populating the topic table
                    cleaned_topics = row['Topics'].strip('[]').split(',')
                    topics = [topic.strip().strip('"\'') for topic in cleaned_topics if topic.strip()]
                else:
                    continue
                    
                csv_id = row['ID']
                # Use the mapped database ID instead of the CSV ID
                pims_id = csv_id_to_db_id_map.get(csv_id)
                
                if pims_id:  # Only proceed if we have a valid database ID
                    for topic_name in topics:
                        topic_id = topic_mapping.get(topic_name)
                        if topic_id:
                            # Create a tuple of pims_id and topic_id
                            entry = (pims_id, topic_id)
                            
                            # Only add if we haven't seen this combination before
                            if entry not in seen_topic_entries:
                                seen_topic_entries.add(entry)
                                pims_entry_topic_data.append(entry)

        # Use execute_values with batches
        if pims_entry_topic_data:  # Only proceed if we have data to insert
            batch_size = 100
            for i in range(0, len(pims_entry_topic_data), batch_size):
                batch = pims_entry_topic_data[i:i+batch_size]
                execute_values(cursor,
                               "INSERT INTO pims_entry_topic (pims_id, topic_id) VALUES %s ON CONFLICT (pims_id, topic_id) DO NOTHING",
                               batch
                               )
            print("✅ pims_entry_topic table populated.")
        else:
            print("⚠️ No valid topic entries to insert.")

        # --- Populate languages table (if not already populated) ---
        languages = ['English', 'French']  # Add more languages as needed
        execute_values(cursor,
                       "INSERT INTO languages (language_name) VALUES %s ON CONFLICT (language_name) DO NOTHING",
                       [(lang,) for lang in languages]
                       )
        print("✅ Languages table populated.")

        # --- Commit all changes ---
        conn.commit()
        print("🎉 All data successfully imported into the database.")

    except psycopg2.Error as e:
        if conn:
            conn.rollback()
            print(f"❌ Transaction rolled back due to error: {e}")
    finally:
        if conn:
            cursor.close()
            conn.close()
            print("🔌 Database connection closed.")

if __name__ == "__main__":
    # 🔹 Supabase connection URL (replace with actual credentials)
    SUPABASE_DB_URL = "your_supabase_connection_string"

    # 🔹 Path to your CSV file
    CSV_FILE_PATH = "data1.csv"

    create_and_populate_pims_database(CSV_FILE_PATH, SUPABASE_DB_URL)
