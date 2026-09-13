-- ============================================================
-- EduCore — Part 3 Database Schema
-- Run this in Supabase: Dashboard → SQL Editor → New Query → Run
-- (Run this AFTER part1_schema.sql, part2_schema.sql, and storage_policies.sql)
-- ============================================================

-- ---------- Quiz System ----------

create table if not exists public.quiz_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text default 'quiz',
  course_id uuid references public.courses(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.quiz_categories(id) on delete cascade,
  title text not null,
  difficulty text not null default 'medium', -- 'easy' | 'medium' | 'hard'
  time_limit_seconds int default 300,
  negative_marking boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  question text not null,
  options jsonb not null, -- ["Option A", "Option B", "Option C", "Option D"]
  correct_index int not null,
  explanation text,
  order_index int not null default 0
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  score int not null default 0,
  total_questions int not null default 0,
  correct_count int not null default 0,
  time_taken_seconds int,
  answers jsonb, -- [{question_id, selected_index, correct}]
  completed_at timestamptz not null default now()
);

alter table public.quiz_categories enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

create policy "Anyone signed in can view quiz categories"
  on public.quiz_categories for select using (auth.role() = 'authenticated');
create policy "Anyone signed in can view quizzes"
  on public.quizzes for select using (auth.role() = 'authenticated');
create policy "Anyone signed in can view quiz questions"
  on public.quiz_questions for select using (auth.role() = 'authenticated');

create policy "Users can view their own quiz attempts"
  on public.quiz_attempts for select using (auth.uid() = user_id);
create policy "Users can insert their own quiz attempts"
  on public.quiz_attempts for insert with check (auth.uid() = user_id);

-- Admins can manage quiz content
create policy "Admins can manage quiz categories"
  on public.quiz_categories for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can manage quizzes"
  on public.quizzes for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can manage quiz questions"
  on public.quiz_questions for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Leaderboard needs to read everyone's attempts + names — a view keeps this safe
-- (only exposes score totals and names, not full attempt/answer detail)
create or replace view public.leaderboard as
select
  p.id as user_id,
  p.full_name,
  p.department,
  coalesce(sum(qa.correct_count), 0) as total_correct,
  coalesce(sum(qa.total_questions), 0) as total_questions,
  count(qa.id) as quizzes_taken
from public.profiles p
left join public.quiz_attempts qa on qa.user_id = p.id
group by p.id, p.full_name, p.department
order by total_correct desc;

grant select on public.leaderboard to authenticated;

-- ---------- Attendance Calculator ----------

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade,
  total_classes int not null default 0,
  attended_classes int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.attendance_records enable row level security;
create policy "Users manage their own attendance"
  on public.attendance_records for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- GPA Calculator ----------

create table if not exists public.gpa_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  semester text not null,
  courses jsonb not null, -- [{name, credit_hours, grade_point}]
  gpa numeric(3,2),
  created_at timestamptz not null default now()
);

alter table public.gpa_records enable row level security;
create policy "Users manage their own GPA records"
  on public.gpa_records for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Community Feed ----------

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  course_id uuid references public.courses(id) on delete set null,
  likes_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.community_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.community_likes (
  post_id uuid references public.community_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  primary key (post_id, user_id)
);

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;

create policy "Anyone signed in can view posts"
  on public.community_posts for select using (auth.role() = 'authenticated');
create policy "Users can create posts"
  on public.community_posts for insert with check (auth.uid() = user_id);
create policy "Users can delete their own posts"
  on public.community_posts for delete using (auth.uid() = user_id);

create policy "Anyone signed in can view comments"
  on public.community_comments for select using (auth.role() = 'authenticated');
create policy "Users can create comments"
  on public.community_comments for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments"
  on public.community_comments for delete using (auth.uid() = user_id);

create policy "Anyone signed in can view likes"
  on public.community_likes for select using (auth.role() = 'authenticated');
create policy "Users can like posts"
  on public.community_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike their own likes"
  on public.community_likes for delete using (auth.uid() = user_id);

-- Keep likes_count in sync automatically
create or replace function public.handle_like_change()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.community_posts set likes_count = likes_count + 1 where id = new.post_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.community_posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_like_change on public.community_likes;
create trigger on_like_change
  after insert or delete on public.community_likes
  for each row execute procedure public.handle_like_change();

-- ---------- Sample Quiz Data (so Part 3 has something to test with) ----------

insert into public.quiz_categories (name, description, icon)
values
  ('Data Structures', 'Arrays, linked lists, trees, and graphs', 'account_tree'),
  ('Thermodynamics', 'Laws of thermodynamics and heat engines', 'thermostat'),
  ('General Aptitude', 'Logical reasoning and quantitative skills', 'psychology')
on conflict do nothing;

insert into public.quizzes (category_id, title, difficulty, time_limit_seconds)
select id, 'Data Structures — Basics', 'easy', 300
from public.quiz_categories where name = 'Data Structures'
on conflict do nothing;

insert into public.quiz_questions (quiz_id, question, options, correct_index, explanation, order_index)
select
  q.id,
  'Which data structure uses LIFO (Last In, First Out) order?',
  '["Queue", "Stack", "Linked List", "Array"]'::jsonb,
  1,
  'A Stack follows Last In, First Out — the last element pushed is the first one popped.',
  1
from public.quizzes q where q.title = 'Data Structures — Basics'
on conflict do nothing;

insert into public.quiz_questions (quiz_id, question, options, correct_index, explanation, order_index)
select
  q.id,
  'What is the time complexity of searching in a balanced binary search tree?',
  '["O(1)", "O(n)", "O(log n)", "O(n^2)"]'::jsonb,
  2,
  'A balanced BST halves the search space at each step, giving O(log n).',
  2
from public.quizzes q where q.title = 'Data Structures — Basics'
on conflict do nothing;

insert into public.quiz_questions (quiz_id, question, options, correct_index, explanation, order_index)
select
  q.id,
  'Which traversal visits the root node first?',
  '["In-order", "Pre-order", "Post-order", "Level-order"]'::jsonb,
  1,
  'Pre-order traversal visits Root → Left → Right.',
  3
from public.quizzes q where q.title = 'Data Structures — Basics'
on conflict do nothing;
