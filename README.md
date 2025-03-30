
# Multi-Website Project with Data Processing

## Project Structure

```
├── data_and_scripts/        # Data processing and database scripts
│   ├── data_cleaning_script.py
│   ├── DATA_raw.csv
│   ├── PIMS.sql
│   └── SQL_import_script.py
│
└── website_code/            # Web applications
    ├── website1/           # First Next.js website
    └── website2/           # Second Next.js website
```

## Overview

This project consists of two main parts:

1. **Data Processing Scripts**

   - Python scripts for data cleaning and SQL database operations
   - Raw data storage and SQL schema definitions
   - Database import utilities
2. **Web Applications**

   - Two separate Next.js websites with TypeScript
   - Built with modern tech stack including:
     - TailwindCSS for styling
     - Component-based architecture
     - Type-safe development with TypeScript

## Tech Stack

- **Backend/Data Processing**

  - Python
  - SQL
  - Supabase
- **Frontend (Websites)**

  - Next.js
  - TypeScript
  - TailwindCSS
  - PNPM (Package Manager)

## Getting Started

### Data Processing

1. Place your raw data in `data_and_scripts/DATA_raw.csv`
2. Run the data cleaning script:

```bash
python data_and_scripts/data_cleaning_script.py
```

3. Import data to SQL using:

```bash
python data_and_scripts/SQL_import_script.py
```

### Website Development

Each website can be run independently:

```bash
# For website1
cd website_code/website1
pnpm install
pnpm dev

# For website2
cd website_code/website2
pnpm install
pnpm dev
```

## Project Structure Details

### Data and Scripts

- `data_cleaning_script.py` - Data preprocessing and cleaning
- `DATA_raw.csv` - Raw data storage
- `PIMS.sql` - SQL database schema and queries
- `SQL_import_script.py` - Database import automation

### Websites

Both websites follow Next.js 13+ structure with:

- `/app` - App router and pages
- `/components` - Reusable UI components
- `/contexts` - React context providers
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and shared logic
- `/public` - Static assets
- `/styles` - Global styles and CSS modules
