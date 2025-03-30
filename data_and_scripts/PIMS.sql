-- Drop existing tables if they exist (for a clean start)
drop table if exists topic_translations;

drop table if exists pims_entry_topic;

drop table if exists pims_main_translations;

drop table if exists pims_main;

drop table if exists topic;

drop table if exists locations;

drop table if exists organizations;

drop table if exists languages;

-- 1. Create languages table
create table languages (
  language_id int primary key generated always as identity,
  language_name varchar(50) not null unique
);

-- 2. Create organizations table (Independent)
create table organizations (
  organization_id int primary key generated always as identity,
  organization_name varchar(255) unique not null
);

-- 3. Create locations table (Independent)
create table locations (
  location_id int primary key generated always as identity,
  city varchar(100),
  province varchar(100),
  unique (city, province)
);

-- 4. Create topic table (Independent)
create table topic (
  topic_id int primary key generated always as identity,
  topic_name varchar(255) unique
);

-- 5. Create pims_main table (Depends on organizations & locations)
create table pims_main (
  id int primary key generated always as identity,
  title varchar(255),
  organization_id int,
  location_id int,
  date date,
  summary text,
  source_link text,
  has_photos boolean default false,
  type varchar(100),
  foreign key (organization_id) references organizations (organization_id) on delete set null,
  foreign key (location_id) references locations (location_id) on delete set null,
  unique (title, organization_id, location_id, date)
);

-- 6. Create pims_main_translations table (Depends on pims_main & languages)
create table pims_main_translations (
  id int primary key generated always as identity,
  pims_id int not null,
  language_id int not null,
  title varchar(255),
  summary text,
  source_link text,
  foreign key (pims_id) references pims_main (id) on delete cascade,
  foreign key (language_id) references languages (language_id)
);

-- 7. Create pims_entry_topic table (Links pims_main and topic)
create table pims_entry_topic (
  pims_id int not null,
  topic_id int not null,
  foreign key (pims_id) references pims_main (id) on delete cascade,
  foreign key (topic_id) references topic (topic_id) on delete cascade,
  primary key (pims_id, topic_id)
);

-- 8. Create topic_translations table (Depends on topic & languages)
create table topic_translations (
  id int primary key generated always as identity,
  topic_id int not null,
  language_id int not null,
  translated_topic varchar(255),
  foreign key (topic_id) references topic (topic_id) on delete cascade,
  foreign key (language_id) references languages (language_id)
);
