-- ============================================================
-- Brew — Message Attachments Storage Bucket
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Create storage bucket for message attachments
insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', true)
on conflict (id) do nothing;

-- Policy: authenticated users can upload
create policy "auth users can upload message attachments"
on storage.objects for insert
to authenticated
with check (bucket_id = 'message-attachments');

-- Policy: anyone can read (since messages are already RLS-protected)
create policy "public can read message attachments"
on storage.objects for select
using (bucket_id = 'message-attachments');

-- Policy: sender can delete their own uploads
create policy "uploader can delete message attachments"
on storage.objects for delete
to authenticated
using (bucket_id = 'message-attachments' and auth.uid()::text = (storage.foldername(name))[1]);
