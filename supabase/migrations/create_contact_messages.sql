-- Run this in your Supabase SQL editor to create the contact_messages table

create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Allow the service role (used by supabaseAdmin) to read/write/delete rows.
-- Disable RLS so the service role key has full access from the API routes.
alter table contact_messages disable row level security;
