-- Run this in your Supabase SQL editor to create the hero card tables
-- These power the 3 rotating cards on the homepage hero (Stats / Job Openings / Team Profiles)

create table if not exists hero_stats (
  id          text primary key,
  value       text not null,
  label       text not null,
  icon_key    text not null default 'chart',
  sort_order  int not null default 0
);

create table if not exists hero_jobs (
  id          text primary key,
  job_title   text not null,
  location    text not null,
  label       text not null,
  sort_order  int not null default 0
);

create table if not exists hero_profiles (
  id          text primary key,
  name        text not null,
  role        text not null,
  sub         text not null,
  initial     text not null,
  image_url   text,
  sort_order  int not null default 0
);

-- Seed with the existing hardcoded content so nothing changes visually until edited in admin
insert into hero_stats (id, value, label, icon_key, sort_order) values
  ('s1', '150+', 'Recruiters', 'chart', 0),
  ('s2', '10k+', 'Placements', 'users', 1),
  ('s3', '500+', 'Companies', 'building', 2)
on conflict (id) do nothing;

insert into hero_jobs (id, job_title, location, label, sort_order) values
  ('j1', 'Java Developer', 'Remote / Hybrid', 'We are Hiring', 0),
  ('j2', 'React Native Dev', 'Bengaluru, India', 'Urgent Requirement', 1),
  ('j3', 'DevOps Engineer', 'Hyderabad, On-site', 'Top Priority', 2)
on conflict (id) do nothing;

insert into hero_profiles (id, name, role, sub, initial, image_url, sort_order) values
  ('p1', 'Rahul Verma', 'Full-Stack Developer', 'MERN | AWS', 'R', null, 0),
  ('p2', 'Sarah Jenkins', 'UI/UX Designer', 'Figma | Adobe', 'S', null, 1),
  ('p3', 'Mike Chen', 'Backend Lead', 'Go | Kubernetes', 'M', null, 2)
on conflict (id) do nothing;

-- Disable RLS so the service role (used by supabaseAdmin) has full write access
-- from the admin API routes, matching the pattern used by contact_messages.
alter table hero_stats disable row level security;
alter table hero_jobs disable row level security;
alter table hero_profiles disable row level security;
