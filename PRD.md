Product Requirements Document (PRD): The Vibe Coder Life DashboardVersion: 1.0Date: December 12, 2025Author: Arpit Chandak (Vibe Coder)Target Platform: Web (Mobile Responsive)Domain: arpitchandak.com1. Executive SummaryThe Life Dashboard is a personal, self-hosted web application designed to track and visualize the user's daily habits. It serves as a "quantified self" hub, aggregating data from physical activity (Strava), reading habits (OpenLibrary), and personal reflections (Sentiment Analysis). The core value proposition is the "GitHub-style Heatmap," which visualizes consistency across these disparate domains in a single grid.Core Philosophy: "Vibe Coding" — The app is built using an "Indie Stack" (Next.js, Supabase, Clerk) prioritized for ease of maintenance, rapid iteration, and high "promptability" for AI assistants like Google Antigravity and Cursor.2. Tech Stack & Architecture2.1 The "Indie Stack"Frontend Framework: Next.js 15+ (App Router).Styling: Tailwind CSS + Shadcn/UI (Radix Primitives).Database: Supabase (PostgreSQL).Authentication: Clerk (Social Login + Session Management).Deployment: Vercel (Zero-config, automatic SSL).Icons: Lucide React.2.2 System ArchitectureServer Actions: All backend logic (API calls, DB writes) resides in Next.js Server Actions to ensure type safety and security.Cron Jobs: Vercel Cron is used to periodically sync data from Strava to prevent rate limiting.Agentic Workflow: The codebase is structured to be easily parsed by AI Agents (Cursor/Antigravity) with clear separation of concerns.3. Database Schema (Supabase)Agent Note: Use these exact table definitions when generating SQL or migrations.3.1 usersSyncs with Clerk authentication to maintain referential integrity.SQLcreate table public.users (
  id text primary key, -- Matches Clerk User ID (e.g., 'user_2xyz...')
  email text unique not null,
  display_name text,
  created_at timestamptz default now()
);
3.2 integrationsStores long-lived OAuth tokens for background syncing.SQLcreate table public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) not null,
  provider text not null, -- e.g., 'strava'
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null, -- Unix timestamp
  provider_user_id text, -- e.g., Strava Athlete ID
  unique(user_id, provider)
);
3.3 booksTracks the reading list.SQLcreate table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) not null,
  title text not null,
  author text not null,
  cover_url text, -- OpenLibrary Cover URL
  status text check (status in ('reading', 'completed', 'wishlist')),
  total_pages int,
  current_page int default 0,
  started_at date,
  completed_at date
);
3.4 daily_logsThe central aggregation table for the Heatmap.SQLcreate table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) not null,
  date date not null,
  
  -- Manual Inputs
  mood_score int check (mood_score between 1 and 5),
  journal_entry text,
  sentiment_score int, -- Calculated via AI/Library (-5 to 5)
  
  -- Automated Inputs (Cached)
  strava_summary jsonb, -- e.g. {"distance": 5000, "moving_time": 1800, "type": "Run"}
  pages_read_count int default 0,
  
  unique(user_id, date)
);
4. Feature Specifications4.1 Authentication (Clerk)Requirement: Users must sign in to view the dashboard.Implementation: Wrap the root layout in <ClerkProvider>. Use middleware.ts to protect all routes under /dashboard.UX: Use Clerk's pre-built <SignIn /> component centered on a minimal landing page.4.2 Strava Integration (Physical Habit)Goal: Automatically track runs/rides without manual entry.Flow:User clicks "Connect Strava" in Settings.Redirect to Strava OAuth URL with scope activity:read_all.Callback handler exchanges code for access_token and refresh_token.Store tokens in integrations table.Sync Logic:On dashboard load (or via Cron), check if integrations.expires_at is past.If expired, use refresh_token to get new tokens.Fetch activities from Strava API (/athlete/activities).Upsert summaries into daily_logs.strava_summary.4.3 Book Tracker (Intellectual Habit)Goal: Search and track reading progress without Goodreads.API: OpenLibrary API.Search: https://openlibrary.org/search.json?q={query}&fields=key,title,author_name,cover_iCovers: https://covers.openlibrary.org/b/id/{cover_i}-L.jpgUX:"Add Book" button opens a Shadcn Dialog.Search bar queries OpenLibrary.Clicking a result adds it to the books table with status reading.Daily Check-in modal asks: "Did you read today?" -> Update current_page.4.4 Daily Check-in & Sentiment (Mental Habit)Goal: Low-friction journaling with immediate "Vibe" feedback.UX:A simple form: "How was your day?" (Textarea) + Mood Slider (1-5).Logic:On submit, use the sentiment npm package (AFINN-165) to analyze the text.Save the calculated score to daily_logs.sentiment_score.If score > 3, display a 🔥 emoji. If score < -2, display a ☁️ emoji.4.5 The "Vibe" HeatmapGoal: Visualize consistency.Library: react-calendar-heatmap.Scoring Algorithm:0 points: No data.1 point: Journal entry OR Mood logged.2 points: Above + (Strava Activity > 20mins OR Pages Read > 10).3 points: Above + High Sentiment Score (> 2).4 points: Perfect day (Activity + Reading + Journaling).Colors: GitHub Greens (#ebedf0 to #216e39).5. Implementation Phases (Agent Task List)Agent Instructions: Execute these phases sequentially. Do not proceed to Phase N+1 until Phase N is verified.Phase 1: Skeleton & AuthInitialize Next.js app (npx create-next-app@latest) with Tailwind and TypeScript.Install Shadcn/UI (npx shadcn@latest init).Set up Clerk Authentication (npm install @clerk/nextjs).Create layout.tsx with ClerkProvider and a middleware.ts file.Deliverable: A protected /dashboard route that redirects to Clerk login.Phase 2: Database & Manual EntrySet up Supabase project.Create daily_logs table (SQL provided in Section 3.4).Create a Server Action saveLog(formData) to insert data.Build a "Check-in" UI component (Shadcn Dialog) with a Form.Integrate sentiment package for text analysis.Deliverable: User can save a text note and mood, which appears in Supabase.Phase 3: External APIs (The "Vibe" Layer)Strava:Create integrations table.Build OAuth route handlers (/api/auth/strava and /api/auth/strava/callback).Implement token rotation logic.Books:Create books table.Build a search component using fetch('openlibrary.org/search...').Save selected books to DB.Deliverable: "Connect Strava" button works; Book search returns real results.Phase 4: The Heatmap & DeploymentInstall react-calendar-heatmap.Create a transformation function to convert daily_logs into { date, count } format based on the scoring algorithm (Section 4.5).Render the heatmap on /dashboard.Deploy to Vercel.Configure Custom Domain (arpitchandak.com).6. Constraints & Rules (for Cursor AI)Rule 1: Always use lucide-react for icons.Rule 2: Use zod for all form validation.Rule 3: Do not create separate API routes (pages/api) unless absolutely necessary for webhooks. Use Server Actions for all data mutations.Rule 4: Styling must be mobile-first using standard Tailwind utility classes.Rule 5: When fetching external APIs (Strava/OpenLibrary), always wrap in try/catch and handle rate limits gracefully.