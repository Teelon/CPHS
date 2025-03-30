
# Pride History Archive

A digital archive application for preserving and exploring LGBTQ+ historical events, articles, and resources.

![Pride History Archive](https://placeholder.svg?height=400&width=800)

## Overview

The Pride History Archive is a comprehensive digital platform designed to document, preserve, and make accessible the rich history of LGBTQ+ communities. This application serves as both a public-facing archive for researchers, educators, and community members, as well as an administrative dashboard for content managers to add, edit, and organize historical content.

## Features

### Public Features

- **Event Browsing**: Explore historical events with filtering by date, location, organization, and topics
- **Interactive Map**: Visualize events geographically on an interactive map
- **Advanced Search**: Find specific content with comprehensive search capabilities
- **Article Reading**: Access in-depth articles about historical events and figures
- **Responsive Design**: Optimized for all devices from mobile to desktop

### Administrative Features

- **Dashboard**: Overview of archive metrics and recent activity
- **Content Management**: Add, edit, and delete events and articles
- **Multilingual Support**: Add translations for content in multiple languages
- **Topic Management**: Organize content with customizable topics
- **User Management**: Control access and permissions for administrative users

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS, shadcn/ui components
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Teelon/CPHS.git
   cd CPHS

   ```

### ENV

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
