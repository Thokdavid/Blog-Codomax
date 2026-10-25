-- ============================================================
-- Supabase Setup Script for Blog Codomax
-- ============================================================
-- 1. Go to your Supabase Dashboard: zoqtqudjisgkevclliqv.supabase.co
-- 2. Navigate to: SQL Editor > New Query
-- 3. Paste this entire script
-- 4. Click "RUN"
-- ============================================================

-- ===== 1. Create the blogs table =====
create table if not exists public.blogs (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    category text,
    tags text[],
    thumbnail text,
    content text,
    excerpt text,
    status text default 'draft' check (status in ('published', 'draft', 'archived')),
    author uuid,
    author_name text,
    views integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists blogs_author_idx on public.blogs(author);
create index if not exists blogs_status_idx on public.blogs(status);
create index if not exists blogs_category_idx on public.blogs(category);
create index if not exists blogs_created_at_idx on public.blogs(created_at desc);

-- ===== 2. Enable Row Level Security =====
-- Since the backend uses the anon key and handles auth itself,
-- we disable RLS (the backend's JWT middleware handles authorization)
-- This is for development. For production with client-side Supabase,
-- enable RLS and add proper policies.
-- alter table public.blogs enable row level security;

-- ===== 3. Create / verify the storage bucket =====
-- The "Blogs" bucket should already exist. If not, create it:
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('Blogs', 'Blogs', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
on conflict (id) do nothing;

-- ===== 4. Storage policies for image uploads =====
-- Allow public read access to all objects
create policy "Public Access" on storage.objects
    for select using (true);

-- Allow authenticated and anon uploads (backend handles auth)
create policy "Allow upload for authenticated users" on storage.objects
    for insert with check (auth.uid() is not null);

-- Allow anon upload to the Blogs bucket (needed for backend anon key)
create policy "Allow anon upload to Blogs bucket" on storage.objects
    for insert to authenticated with check (bucket_id = 'Blogs');

create policy "Allow anon upload to Blogs bucket" on storage.objects
    for insert to anon with check (bucket_id = 'Blogs');

-- Allow anon update and delete on Blogs bucket
create policy "Allow anon update on Blogs bucket" on storage.objects
    for update to anon using (bucket_id = 'Blogs');

create policy "Allow anon delete on Blogs bucket" on storage.objects
    for delete to anon using (bucket_id = 'Blogs');
