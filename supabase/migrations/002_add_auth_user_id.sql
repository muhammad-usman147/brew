-- ============================================================
-- Patch: add auth_user_id to existing tables
-- Run this if you created tables from the earlier schema
-- that didn't include auth_user_id
-- ============================================================

alter table influencers add column if not exists auth_user_id uuid unique;
alter table clients     add column if not exists auth_user_id uuid unique;
