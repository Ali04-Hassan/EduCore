# EduCore — Part 1 of 3 (Foundation)

This is **Part 1** of the EduCore build: authentication, dashboard, profile,
notifications, and settings — all wired to a real Supabase backend, with the
exact visual design from the Stitch export (38-screen design system).

- **Fixed**: "Account Settings" and "Notifications" rows on the Profile page
  did nothing when clicked. They're plain `<div>`s in the original design
  (not `<a>`/`<button>`), so `LegacyScreen`'s generic auto-wiring never
  touched them. The Profile page now wires these two rows directly to
  `/settings` and `/notifications`.

## Changelog (This Version)

- **Fixed**: Signup and Forgot Password buttons doing nothing when clicked. Root
  cause: `LegacyScreen` (the component that renders converted Stitch screens)
  auto-wires any button/link to a route by matching its visible text (e.g. a
  button labeled "Create Account" was being auto-wired to navigate to
  `/signup`). On pages where a button already has real logic (calling
  Supabase), this created two competing click handlers, and the auto-navigate
  one interrupted the real one. Fixed by having `LegacyScreen` skip any
  element that has an explicit `id` — those are exactly the elements a page
  wires up itself.
- **Fixed**: "Forgot Password" email link was pointing to the OTP-code page
  instead of the actual reset-password page. It now correctly redirects to
  `/reset-password`.

## What's Working in Part 1

| Screen | Status |
|---|---|
| Welcome | ✅ Static landing page |
| Login | ✅ Real Supabase Auth (email/password + Google OAuth) |
| Signup | ✅ Real Supabase Auth, creates a `profiles` row automatically |
| OTP Verification | ✅ Real email OTP via Supabase |
| Forgot Password | ✅ Real password reset email |
| Reset Password | ✅ Real password update |
| Dashboard | ✅ Layout + navigation wired (stats are illustrative — real stats land in Part 3 with the quiz engine) |
| Profile | ✅ Real name/department pulled from your account; Sign Out works |
| Settings | ✅ Notification toggles (Push/Email/Study Reminders) save to your real profile |
| Notifications | ✅ Real per-user notification list from Supabase (mark as read / mark all read) |

**Not yet built** (coming in Part 2 and Part 3 — see roadmap below): Courses,
Notes, Assignments, Quizzes, AI Assistant content, Leaderboard, GPA/Attendance
calculators, Community Feed, Admin Dashboard, Pricing page.
*(The routes/screens for these already exist from an earlier build round and
still render with illustrative content — they'll be rebuilt with real data in
Part 2/3.)*

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Go to **Authentication → Providers** → confirm **Email** is enabled (enable **Google** too if you want Google sign-in)
3. Go to **SQL Editor** → **New Query** → paste the entire contents of
   [`supabase/part1_schema.sql`](supabase/part1_schema.sql) → **Run**
4. Go to **Settings → API** → copy your **Project URL** and **anon public key**

### 3. Environment variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```
(Gemini key isn't used yet in Part 1 — it powers the AI Assistant in Part 3.
Get a free one at [aistudio.google.com](https://aistudio.google.com) whenever
you're ready.)

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
Push to GitHub → import into [vercel.com](https://vercel.com) → add the same
three environment variables → Deploy.

## Database Schema (Part 1)

Run [`supabase/part1_schema.sql`](supabase/part1_schema.sql) in the Supabase
SQL Editor. It creates:
- **`profiles`** — one row per user (name, department, semester, role,
  notification preferences), auto-created on signup via a trigger
- **`notifications`** — per-user notification feed
- **`admin_requests`** — table is ready now; the request/approval UI itself
  will be built in Part 3 alongside the Admin Dashboard

## Roadmap

- **Part 2 (next)**: My Courses, Course Content, Study Notes, Previous Papers,
  Assignments, Video Lesson Player, PDF Reader, Academic Calendar
- **Part 3**: MCQ Quiz, Quiz Categories/Results, Practice Mode, Performance
  Insights, Leaderboard, AI Assistant (Gemini), Community Feed, Attendance
  Calculator, GPA Calculator, Pricing (UI only), Admin Dashboard + admin
  request/approval flow

## Tech Stack

| Purpose | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 (EduCore design tokens from Stitch) |
| Auth + Database | Supabase (free tier) |
| AI (from Part 3) | Google Gemini API (`gemini-2.5-flash`, free tier) |
| Hosting | Vercel |
