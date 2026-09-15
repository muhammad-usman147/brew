-- Enable Realtime for messages table
-- Run this in Supabase SQL Editor

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table connections;
