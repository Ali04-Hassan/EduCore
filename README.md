# EduCore — Part 1 + Part 2

This repo now includes **Part 1** (authentication, dashboard, profile,
settings, notifications) and **Part 2** (courses, course content, study
notes, assignments, previous papers, academic calendar, PDF reader) — all
wired to a real Supabase backend, with the exact visual design from the
Stitch export (38-screen design system).

## Changelog (Latest)

- **Added**: A dedicated **PDF Reader** page (`/pdf-reader`) matching the
  dark-themed Stitch design (`pdf_reader_dark_mode`), instead of just
  opening files in a new browser tab. It takes a signed file URL and renders
  it in-page with a proper header (filename, download, open-in-new-tab).
  Wired up from both **Study Notes** and **Previous Papers** (new "eye" /
  View icon on each file row).
- **Added**: A **Quick Links** section on the My Courses page (Study Notes,
  Assignments, Past Papers, Calendar) — these four pages existed and worked,
  but had no way to reach them from the app's navigation. They're now
  reachable from Courses (which is already in the bottom nav).
- **Fixed**: "Account Settings" and "Notifications" rows on the Profile page
  did nothing when clicked. They're plain `<div>`s in the original design
  (not `<a>`/`<button>`), so `LegacyScreen`'s generic auto-wiring never
  touched them. The Profile page now wires these two rows directly to
  `/settings` and `/notifications`.
- **Fixed** (Part 1): Signup and Forgot Password buttons doing nothing —
  `LegacyScreen` was auto-wiring a second, conflicting navigation handler
  onto buttons that already had real logic. Fixed by having `LegacyScreen`
  skip any element with an explicit `id`.
- **Fixed** (Part 1): "Forgot Password" email link pointed to the OTP page
  instead of `/reset-password`.

## What's Working in Part 2

| Screen | Status |
|---|---|
| My Courses | ✅ Real courses from Supabase, search + filter by semester, per-course progress bar, Quick Links to Notes/Assignments/Papers/Calendar |
| Course Content | ✅ Real modules (mark complete/incomplete), real YouTube video lessons embedded in-page |
| Study Notes | ✅ Real upload/download/**view (in-app PDF reader)**/delete (Supabase Storage, private per-user) |
| Assignments | ✅ Real assignment list, file upload submission, due-date/overdue tracking |
| Previous Papers | ✅ Real shared upload/download/**view** library (any student can upload, only uploader can delete) |
| Academic Calendar | ✅ Real events grouped by month (exam/assignment/holiday/general) |
| PDF Reader | ✅ Dark-themed in-app viewer, opened from Notes and Previous Papers |

**Note**: On the Profile page, "Subscription" and "Help & Support" rows are
currently decorative — they'll be wired once the Pricing page (Part 3) exists.

## Setting Up Part 2

### 1. Run the Part 2 schema
In Supabase SQL Editor, run [`supabase/part2_schema.sql`](supabase/part2_schema.sql)
(after Part 1's schema). It creates `courses`, `enrollments`, `course_modules`,
`module_progress`, `notes`, `previous_papers`, `assignments`,
`assignment_submissions`, `video_lessons`, and `calendar_events` — and inserts
3 sample courses so the app isn't empty on first run.

### 2. Create 3 storage buckets
In Supabase → **Storage**, create these as **private** buckets:
- `notes`
- `previous-papers`
- `assignments`

### 3. (Optional) Add sample modules/videos/assignments/events
The schema seeds 3 courses but no modules/videos/assignments/calendar events
yet — add a few rows to those tables in the Table Editor so Course Content,
Assignments, and Calendar aren't empty when you test.

## Changelog (This Version)

- **Part 2 fix**: Previous Papers upload used browser `prompt()` dialogs
  asking the user to paste a raw course UUID — replaced with a proper course
  dropdown + year field.
- **Part 2 fix**: Completing/un-completing a module in Course Content now
  updates the course's overall progress % (shown on the My Courses list) —
  previously the two were out of sync.

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

- **Part 2 — Done**: My Courses, Course Content, Study Notes, Previous
  Papers, Assignments, Academic Calendar
- **Part 3 (next)**: MCQ Quiz, Quiz Categories/Results, Practice Mode,
  Performance Insights, Leaderboard, AI Assistant (Gemini), Community Feed,
  Attendance Calculator, GPA Calculator, Pricing (UI only), Admin Dashboard +
  admin request/approval flow

## Tech Stack

| Purpose | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 (EduCore design tokens from Stitch) |
| Auth + Database | Supabase (free tier) |
| AI (from Part 3) | Google Gemini API (`gemini-2.5-flash`, free tier) |
| Hosting | Vercel |
