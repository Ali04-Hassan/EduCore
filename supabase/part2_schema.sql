-- ============================================================
-- EduCore — Part 2 Database Schema
-- Run this in Supabase: Dashboard → SQL Editor → New Query → Run
-- (Run this AFTER part1_schema.sql)
-- ============================================================

-- Courses (catalog — admin-managed in Part 3, readable by everyone for now)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course_code text,
  department text,
  semester text,
  instructor text,
  credit_hours int default 3,
  description text,
  cover_color text default '#0f0865',
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Anyone authenticated can view courses"
  on public.courses for select
  using (auth.role() = 'authenticated');

-- Per-user enrollment + progress
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  progress_percent int not null default 0,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.enrollments enable row level security;

create policy "Users manage their own enrollments"
  on public.enrollments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Course modules / chapters (for Course Content screen)
create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.course_modules enable row level security;

create policy "Anyone authenticated can view course modules"
  on public.course_modules for select
  using (auth.role() = 'authenticated');

-- Per-user module completion tracking
create table if not exists public.module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module_id uuid references public.course_modules(id) on delete cascade not null,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, module_id)
);

alter table public.module_progress enable row level security;

create policy "Users manage their own module progress"
  on public.module_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Study Notes (uploaded by students — private storage, per-user)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  file_path text not null,
  file_type text,
  file_size_kb int,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "Users manage their own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Previous Papers (shared library — anyone can view/download, only owner can delete their upload)
create table if not exists public.previous_papers (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid references auth.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  year text,
  file_path text not null,
  created_at timestamptz not null default now()
);

alter table public.previous_papers enable row level security;

create policy "Anyone authenticated can view previous papers"
  on public.previous_papers for select
  using (auth.role() = 'authenticated');

create policy "Users can upload previous papers"
  on public.previous_papers for insert
  with check (auth.uid() = uploaded_by);

create policy "Users can delete their own uploaded papers"
  on public.previous_papers for delete
  using (auth.uid() = uploaded_by);

-- Assignments (course-level, visible to all students in that course)
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  due_date timestamptz,
  points int default 100,
  created_at timestamptz not null default now()
);

alter table public.assignments enable row level security;

create policy "Anyone authenticated can view assignments"
  on public.assignments for select
  using (auth.role() = 'authenticated');

-- Assignment submissions (per student, private file upload)
create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_path text,
  submitted_at timestamptz not null default now(),
  status text not null default 'submitted', -- 'submitted' | 'graded'
  grade int,
  unique (assignment_id, user_id)
);

alter table public.assignment_submissions enable row level security;

create policy "Users manage their own submissions"
  on public.assignment_submissions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Video lessons (YouTube links embedded, per course)
create table if not exists public.video_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  youtube_url text not null,
  duration_minutes int,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.video_lessons enable row level security;

create policy "Anyone authenticated can view video lessons"
  on public.video_lessons for select
  using (auth.role() = 'authenticated');

-- Academic calendar events
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  event_type text not null default 'general', -- 'exam' | 'assignment' | 'holiday' | 'general'
  course_id uuid references public.courses(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.calendar_events enable row level security;

create policy "Anyone authenticated can view calendar events"
  on public.calendar_events for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- Storage buckets (create these manually in Supabase Dashboard → Storage)
-- ============================================================
-- 1. "notes"            → private   (student's own study notes)
-- 2. "previous-papers"  → private   (shared exam papers, RLS controls access)
-- 3. "assignments"      → private   (assignment submission files)

-- ============================================================
-- Sample data (optional — lets you see the app populated immediately)
-- ============================================================
insert into public.courses (title, course_code, department, semester, instructor, credit_hours, description, cover_color)
values
  ('Advanced Mathematics', 'MATH-301', 'Computer Science', 'Semester 5', 'Prof. Alan Turing', 3, 'Linear algebra, differential equations, and numerical methods.', '#0f0865'),
  ('Data Structures & Algorithms', 'CS-241', 'Computer Science', 'Semester 3', 'Dr. Grace Hopper', 4, 'Core data structures, algorithm design, and complexity analysis.', '#1a5632'),
  ('Digital Logic Design', 'EE-211', 'Electrical Engineering', 'Semester 3', 'Dr. Nikola Tesla', 3, 'Boolean algebra, logic gates, and sequential circuits.', '#7a1f2b')
on conflict do nothing;
