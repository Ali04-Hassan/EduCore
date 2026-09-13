# EduCore — Complete (Part 1 + 2 + 3)

This repo includes the full 3-part build: **Part 1** (authentication,
dashboard, profile, settings, notifications), **Part 2** (courses, course
content, study notes, assignments, previous papers, academic calendar, PDF
reader), and **Part 3** (quiz system, AI assistant, leaderboard, performance
insights, GPA/attendance calculators, community feed, pricing, admin
dashboard) — all wired to a real Supabase backend, with the exact visual
design from the Stitch export (38-screen design system).

## Changelog — Part 3 (Latest)

- **Added**: **Community Feed** (`/community`) — real posts, likes, and
  comments, all backed by Supabase (`community_posts`, `community_comments`,
  `community_likes`).
- **Added**: **Pricing** (`/pricing`) — UI only, per your instruction; no
  payment gateway is wired up.
- **Added**: **Admin Dashboard** (`/admin`) — real role-gated page (only
  `profiles.role = 'admin'` can access). Shows platform stats (students,
  courses, notes, quizzes) and a **real admin-request approval queue**:
  approving a request sets that user's role to `admin` in the database.
- **Added**: **Request Admin Access** section on the Settings page — any
  student can submit a request (with an optional reason), which then shows
  up in the Admin Dashboard's approval queue.
- **Fixed**: Six pages (`quiz`, `quiz-results`, `leaderboard`,
  `performance-insights`, `attendance-calculator`, `admin`, `settings`) had
  the same "infinite loading spinner on error" bug found in Part 1/2 —
  missing `try/catch/finally` around their data fetch meant a failed
  Supabase call left the page stuck on "Loading..." forever. All six now
  fail gracefully.
- **Fixed**: Community, GPA Calculator, and Attendance Calculator had no
  navigation entry point anywhere in the app. Added to the Quick Links
  section on the Courses page (now 7 cards). Profile's "Subscription" row
  now correctly routes to `/pricing`.
- **Note on the Admin Dashboard design**: the original Stitch screen
  (`educore_admin_dashboard`) is a large desktop-only screen with a full
  sidebar, detailed student/notes/quiz management tables, and analytics
  charts — making every part of that literally functional (bulk student
  management, content moderation, charts, etc.) is a huge scope on its own.
  What's built instead is a **fully real, working admin dashboard** focused
  on your actual stated need — the admin request/approval workflow — plus
  genuine platform stats, using the app's existing design language rather
  than a pixel-for-pixel recreation of the desktop mockup.

## Changelog — Part 2

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

## Setting Up Part 3

### 1. Run the Part 3 schema
In Supabase SQL Editor, run [`supabase/part3_schema.sql`](supabase/part3_schema.sql)
(after Parts 1 and 2). It creates `quiz_categories`, `quizzes`,
`quiz_questions`, `quiz_attempts`, `attendance_records`, `gpa_records`,
`community_posts`, `community_comments`, `community_likes`, and a
`leaderboard` view.

### 2. Make yourself an admin (first time only)
There's no admin account by default. To create the first one:
1. Sign up / log in normally as yourself
2. In Supabase → **Table Editor** → `profiles`, find your row
3. Change the `role` column from `student` to `admin`
4. Visit `/admin` in the app — you'll now have full access, including
   approving future admin requests from other students (no manual table
   editing needed after this first one)

### 3. (Optional) Add sample quiz content
The schema doesn't seed any quizzes. To test the quiz flow, add rows to
`quiz_categories`, `quizzes`, and `quiz_questions` in the Table Editor (a
`quizzes.category_id` links to `quiz_categories`, and
`quiz_questions.quiz_id` links to `quizzes`).

## What's Working in Part 3

| Screen | Status |
|---|---|
| Practice / Quiz Categories | ✅ Real quiz list grouped by category from Supabase |
| Quiz | ✅ Real timed MCQ quiz, scored on submit |
| Quiz Results | ✅ Real per-attempt breakdown (correct/incorrect, explanations) |
| Performance Insights | ✅ Real accuracy stats aggregated from your quiz attempts |
| Leaderboard | ✅ Real ranking from the `leaderboard` view (total correct answers) |
| AI Assistant | ✅ Real chat powered by Gemini (`gemini-2.5-flash`) |
| Community Feed | ✅ Real posts, likes, comments |
| GPA Calculator | ✅ Real per-semester GPA calculation, save/reload |
| Attendance Calculator | ✅ Real attendance tracking per enrolled course, save/reload |
| Pricing | ✅ UI only — no payment gateway wired up, as requested |
| Admin Dashboard | ✅ Real role-gated access, real admin-request approval queue, real platform stats |

## Important: Storage Bucket Policies (Fixes an Upload Error)

If file uploads (Notes, Previous Papers, Assignments) fail with **"new row
violates row-level security policy"**, it's because creating a Storage
bucket does **not** automatically allow uploads — Storage has its own
row-level security, separate from your database tables. Run
[`supabase/storage_policies.sql`](supabase/storage_policies.sql) in the SQL
Editor (after creating the `notes`, `previous-papers`, and `assignments`
buckets) to fix this.

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

## Status

All 3 planned parts are complete:
- ✅ **Part 1**: Authentication, Dashboard, Profile, Settings, Notifications
- ✅ **Part 2**: My Courses, Course Content, Study Notes, Previous Papers,
  Assignments, Academic Calendar, PDF Reader
- ✅ **Part 3**: MCQ Quiz, Quiz Results, Practice Mode, Performance Insights,
  Leaderboard, AI Assistant (Gemini), Community Feed, Attendance Calculator,
  GPA Calculator, Pricing (UI only), Admin Dashboard + admin request/approval
  flow

Not built (intentionally, per design duplicates or explicit scope
decisions — see changelogs above for why): a second "Quiz Categories"
browser screen (Practice already covers browsing by category), and a fully
interactive recreation of the desktop admin management screen (bulk
student/content management tables, analytics charts).

## Tech Stack

| Purpose | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 (EduCore design tokens from Stitch) |
| Auth + Database | Supabase (free tier) |
| AI | Google Gemini API (`gemini-2.5-flash`, free tier) — powers `/ai-assistant` |
| Hosting | Vercel |

⚠️ If you haven't already, update the `GEMINI_API_KEY` environment variable
(in `.env.local` and in Vercel) with a real key from
[aistudio.google.com](https://aistudio.google.com) — the AI Assistant won't
respond with just the placeholder value.
