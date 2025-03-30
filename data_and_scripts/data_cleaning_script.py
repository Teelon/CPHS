import pandas as pd
import re
import ast

# Load the CSV file into a pandas DataFrame
try:
    data = pd.read_csv('DATA_raw.csv')
except FileNotFoundError:
    print("The file 'DATA_raw.csv' was not found. Please check the file path.")
    exit()

df = pd.DataFrame(data)

# Rename columns to match the expected format
df = df.rename(columns={'City2': 'City', 'Province2': 'Province', 'Date(s)': 'Date'})

# Clean the Organization Name column - convert string lists to actual values
df['Organization Name'] = df['Organization Name'].apply(
    lambda x: ast.literal_eval(x)[0] if isinstance(x, str) and x.startswith('[') else x
)

# Clean the Summary column
def clean_summary(text):
    if pd.isna(text):
        return ''
    # Remove HTML tags
    text = re.sub('<.*?>', '', str(text))
    # Remove special characters and normalize whitespace
    text = re.sub(r'&#58;', ':', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

df['Summary'] = df['Summary'].apply(clean_summary)

# Clean and standardize dates
def clean_date(date_str):
    if pd.isna(date_str):
        return None
    
    # Convert common date formats
    date_str = str(date_str).strip()
    date_str = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str)  # Remove ordinal indicators
    
    # Handle month names
    month_map = {
        'January': '01', 'February': '02', 'March': '03', 'April': '04',
        'May': '05', 'June': '06', 'July': '07', 'August': '08',
        'September': '09', 'October': '10', 'November': '11', 'December': '12'
    }
    
    for month, num in month_map.items():
        date_str = date_str.replace(month, num).replace(month[:3], num)
    
    return date_str

df['Date'] = df['Date'].apply(clean_date)
df['Date'] = pd.to_datetime(df['Date'], errors='coerce')

# Clean Topics column
def clean_topics(topics):
    if pd.isna(topics):
        return []
    try:
        if isinstance(topics, str):
            # Convert string representation of list to actual list
            topics_list = ast.literal_eval(topics)
            # Clean individual topics: remove quotes, brackets, and extra whitespace
            return [re.sub(r'[\[\]"\']', '', topic.strip()) for topic in topics_list]
    except:
        # Fallback: split by comma and clean each topic
        return [re.sub(r'[\[\]"\']', '', topic.strip()) for topic in str(topics).split(',')]
    return []

df['Topics'] = df['Topics'].apply(clean_topics)

# Clean location data
def clean_location(loc):
    if pd.isna(loc):
        return ''
    # Remove special characters and extra spaces
    loc = re.sub(r'[^\w\s-]', '', str(loc))
    return loc.strip()

df['City'] = df['City'].apply(clean_location)
df['Province'] = df['Province'].apply(clean_location)

# Ensure all text fields are stripped of extra whitespace and special characters
text_columns = ['Title', 'Organization Name', 'City', 'Province', 'Summary']
for col in text_columns:
    df[col] = df[col].apply(lambda x: re.sub(r'[^a-zA-Z0-9\s\-.,:]', '', str(x)).strip() if pd.notna(x) else '')

# Add validation columns
df['Has Photos'] = False  # Default value, update based on your needs
df['Event Type'] = ''     # Default value, update based on your needs

# Preview the transformed data
print("\nFirst few rows of transformed data:")
print(df.head())

# Data quality checks
print("\nData quality report:")
print(f"Total rows: {len(df)}")
print("\nMissing values:")
print(df.isnull().sum())
print("\nColumn data types:")
print(df.dtypes)

# After applying clean_topics, verify the results
print("\nSample of cleaned topics:")
print(df['Topics'].head())

# Save the DataFrame to a CSV file
df.to_csv('data1.csv', index=False)
print("\n✅ Data cleaned and saved to 'data1.csv'")
