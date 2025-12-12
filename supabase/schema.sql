-- 3.1 users
-- Syncs with Clerk authentication.
create table public.users (
  id text primary key, -- Matches Clerk User ID
  email text unique not null,
  display_name text,
  created_at timestamptz default now()
);

-- RLS: Public Read, Admin Write
alter table public.users enable row level security;
create policy "Public Read" on public.users for select using (true);
create policy "Admin Write" on public.users for all using (auth.uid()::text = id);

-- 3.2 integrations
-- Stores long-lived OAuth tokens. Strictly Private.
create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) not null,
  provider text not null, -- 'strava'
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,
  provider_user_id text,
  unique(user_id, provider)
);

-- RLS: Private only
alter table public.integrations enable row level security;
create policy "Owner Only" on public.integrations for all using (auth.uid()::text = user_id);

-- 3.3 books
-- Tracks the reading list.
create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) not null,
  title text not null,
  author text not null,
  cover_url text,
  status text check (status in ('reading', 'completed', 'wishlist')),
  total_pages int,
  current_page int default 0,
  started_at date,
  completed_at date
);

-- RLS: Public Read, Admin Write
alter table public.books enable row level security;
create policy "Public Read" on public.books for select using (true);
create policy "Admin Write" on public.books for all using (auth.uid()::text = user_id);

-- 3.4 daily_logs
-- The central aggregation table for the Heatmap.
create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) not null,
  date date not null,
  
  -- Manual Inputs
  mood_score int check (mood_score between 1 and 5),
  journal_entry text, -- Private or Public? (Let's keep text private, score public)
  sentiment_score int, 
  
  -- Automated Inputs (Cached)
  strava_summary jsonb, 
  pages_read_count int default 0,
  
  unique(user_id, date)
);

-- RLS: Public Read, Admin Write
alter table public.daily_logs enable row level security;
create policy "Public Read" on public.daily_logs for select using (true);
create policy "Admin Write" on public.daily_logs for all using (auth.uid()::text = user_id);
