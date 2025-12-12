Product Requirements Document (PRD): The Vibe Coder Life DashboardVersion: 2.1 (Subdomain Hosting)Date: December 12, 2025Author: Arpit Chandak (Vibe Coder)Target Platform: Web (Mobile Responsive)Production URL: life-dashboard.arpitchandak.comMain Website: arpitchandak.com (Hosted on Framer - Do not touch)1. Executive SummaryThe Life Dashboard is a personal "Quantified Self" application hosted on a subdomain.Public View (/): A read-only portfolio showing the user's consistency via a "GitHub-style Heatmap" and reading list.Admin View (/admin): A secure area where the user logs in to journal, add books, and sync Strava.Core Philosophy: "Vibe Coding" — The app is built using an "Indie Stack" (Next.js, Supabase, Clerk) on Vercel, designed to run alongside an existing Framer website without conflict.2. Tech Stack & Architecture2.1 The "Indie Stack"Frontend Framework: Next.js 15+ (App Router).Styling: Tailwind CSS + Shadcn/UI.Database: Supabase (PostgreSQL).Authentication: Clerk (Sign-in enabled, Sign-up disabled).Deployment: Vercel (Subdomain Configuration).2.2 System ArchitecturePublic/Private Split:app/page.tsx: Public Server Component (Read-Only).app/admin/**: Protected Layout (Write-Only).DNS Strategy:arpitchandak.com -> Framer (Unchanged).life-dashboard.arpitchandak.com -> Vercel (This App).3. Database Schema (Supabase)Agent Note: Use these exact table definitions. Note the RLS policies carefully.3.1 usersSyncs with Clerk authentication.SQLcreate table public.users (
  id text primary key, -- Matches Clerk User ID
  email text unique not null,
  display_name text,
  created_at timestamptz default now()
);

-- RLS: Public Read, Admin Write
alter table public.users enable row level security;
create policy "Public Read" on public.users for select using (true);
create policy "Admin Write" on public.users for all using (auth.uid() = id);
3.2 integrationsStores long-lived OAuth tokens. Strictly Private.SQLcreate table public.integrations (
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
create policy "Owner Only" on public.integrations for all using (auth.uid() = user_id);
3.3 booksTracks the reading list.SQLcreate table public.books (
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
create policy "Admin Write" on public.books for all using (auth.uid() = user_id);
3.4 daily_logsThe central aggregation table for the Heatmap.SQLcreate table public.daily_logs (
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
create policy "Admin Write" on public.daily_logs for all using (auth.uid() = user_id);
4. Feature Specifications4.1 Authentication & Routing (Clerk)Configuration: In Clerk Dashboard, Disable "Sign up". Only allow "Sign in".Production Domain: In Clerk, set the production domain to life-dashboard.arpitchandak.com (not the root domain).Middleware (middleware.ts):Public Routes: /, /api/cron(.*).Protected Routes: /admin(.*).4.2 Strava Integration (Physical Habit)Callback URL: The Strava OAuth callback will need to be https://life-dashboard.arpitchandak.com/api/auth/strava/callback.Flow:User visits /admin/settings.Clicks "Connect Strava" -> OAuth Flow.Tokens saved to integrations.4.3 Book Tracker (Intellectual Habit)Admin UX: /admin dashboard has an "Add Book" button.Public UX: / shows a "Currently Reading" card with the book cover and a progress bar.4.4 Daily Check-in & HeatmapVisualization: react-calendar-heatmap.Scoring (0-4): Calculated based on: (Strava Activity + Pages Read + Logged Mood).Public Visibility: Visitors can see that you journaled (a green dot), but they cannot read the journal_entry text.5. Implementation Phases (Agent Task List)Agent Instructions: Execute these phases sequentially.Phase 1: Skeleton & RoutingInitialize Next.js app.Install Shadcn/UI.Set up Clerk. Crucial: Configure middleware.ts to allow public access to the root /.Create app/page.tsx (Public) and app/admin/page.tsx (Protected).Phase 2: Database & PoliciesSet up Supabase tables (daily_logs, books, etc.).Apply RLS Policies: Ensure SELECT using (true) is set for public tables.Create Server Actions for saveLog and addBook.Phase 3: Integrations & DeploymentImplement Strava OAuth in /admin/settings.Implement OpenLibrary Search.Deployment Step:Push to GitHub.Connect Vercel to GitHub.Vercel Domains: Add life-dashboard.arpitchandak.com.DNS: Add a CNAME record in your DNS provider (where you bought the domain) pointing life-dashboard to cname.vercel-dns.com.6. Constraints & Rules (for Cursor/Antigravity)Rule 1: Strict Separation: Never expose journal_entry text or access_token in public API responses.Rule 2: Use Server Components for the public dashboard to ensure fast SEO.Rule 3: Use Server Actions for all /admin form submissions.Rule 4: When generating redirect URLs (like for Strava), always use process.env.NEXT_PUBLIC_BASE_URL to ensure it works on the subdomain.