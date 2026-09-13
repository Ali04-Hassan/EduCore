-- ============================================================
-- EduCore — Storage Bucket Policies (Fix)
-- Run this in Supabase: Dashboard → SQL Editor → New Query → Run
--
-- WHY THIS IS NEEDED: creating a storage bucket (even "Private") does NOT
-- automatically allow anyone to upload/read files in it. Supabase Storage
-- has its own row-level security on the storage.objects table, separate
-- from your database tables. Without these policies, every upload fails
-- with "new row violates row-level security policy".
--
-- All three buckets use the same file path convention: <user_id>/<filename>
-- so a user's own files always live in a folder named after their user id.
-- ============================================================

-- ---------- notes bucket (private — each user sees only their own files) ----------
create policy "Users can upload their own notes"
  on storage.objects for insert
  with check (
    bucket_id = 'notes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own notes"
  on storage.objects for select
  using (
    bucket_id = 'notes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own notes"
  on storage.objects for delete
  using (
    bucket_id = 'notes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------- previous-papers bucket (shared — any signed-in user can read/upload, only the uploader can delete) ----------
create policy "Any signed-in user can view previous papers"
  on storage.objects for select
  using (bucket_id = 'previous-papers' and auth.role() = 'authenticated');

create policy "Any signed-in user can upload previous papers"
  on storage.objects for insert
  with check (
    bucket_id = 'previous-papers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own uploaded papers"
  on storage.objects for delete
  using (
    bucket_id = 'previous-papers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------- assignments bucket (private — each student's submissions are their own) ----------
create policy "Users can upload their own assignment submissions"
  on storage.objects for insert
  with check (
    bucket_id = 'assignments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own assignment submissions"
  on storage.objects for select
  using (
    bucket_id = 'assignments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own assignment submissions"
  on storage.objects for delete
  using (
    bucket_id = 'assignments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
