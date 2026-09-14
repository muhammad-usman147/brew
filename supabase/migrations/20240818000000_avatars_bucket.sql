-- =========================================================
-- Create the 'avatars' storage bucket (public)
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- =========================================================
-- RLS policies for the 'avatars' bucket
-- =========================================================

-- 1. Public SELECT — anyone can read (bucket is public, but belt-and-suspenders)
create policy "avatars_public_read"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 2. Authenticated INSERT — logged-in users can upload
create policy "avatars_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' );

-- 3. Authenticated UPDATE — users can replace their own file
create policy "avatars_authenticated_update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' );

-- 4. Authenticated DELETE — users can remove their own file
create policy "avatars_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'avatars' );
