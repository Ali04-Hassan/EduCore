-- ============================================================
-- EduCore — Part 1 Database Schema
-- Run this in Supabase: Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Extend the auto-created auth.users with an app-level profile row
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  department text,
  semester text,
  role text not null default 'student', -- 'student' | 'admin' | 'pending_admin'
  avatar_url text,
  notification_prefs jsonb not null default '{"push": true, "email": true, "study_reminders": true}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Automatically create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, department, semester)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'semester'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null default 'general', -- 'general' | 'assignment' | 'quiz' | 'announcement'
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Admin access requests
create table if not exists public.admin_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  reason text,
  status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

alter table public.admin_requests enable row level security;

create policy "Users can view their own admin requests"
  on public.admin_requests for select
  using (auth.uid() = user_id);

create policy "Users can create their own admin requests"
  on public.admin_requests for insert
  with check (auth.uid() = user_id);

-- Admins can view/manage everything (checked in Part 3 when the admin dashboard is built)
create policy "Admins can view all admin requests"
  on public.admin_requests for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update admin requests"
  on public.admin_requests for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
