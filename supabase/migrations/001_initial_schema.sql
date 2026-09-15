-- ============================================================
-- Brew — Initial Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── ENUMS ────────────────────────────────────────────────────
create type connection_status as enum ('pending', 'active', 'blocked');
create type campaign_type     as enum ('public', 'private', 'draft');
create type proposal_status   as enum ('pending', 'accepted', 'declined', 'withdrawn');
create type message_type      as enum ('text', 'image', 'video', 'document');

-- ── INFLUENCERS ───────────────────────────────────────────────
create table influencers (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  public_id    varchar unique not null,
  name         varchar not null,
  email        varchar unique not null,
  phone        varchar,
  avatar_url   varchar,
  bio          text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── CLIENTS ──────────────────────────────────────────────────
create table clients (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  public_id    varchar unique not null,
  name         varchar not null,
  email        varchar unique not null,
  phone        varchar,
  company_name varchar not null,
  avatar_url   varchar,
  website      varchar,
  industry     varchar,
  description  text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── CONNECTIONS ───────────────────────────────────────────────
create table connections (
  id            uuid primary key default gen_random_uuid(),
  influencer_id uuid not null references influencers(id) on delete cascade,
  client_id     uuid not null references clients(id) on delete cascade,
  status        connection_status not null default 'pending',
  created_at    timestamptz default now(),
  unique (influencer_id, client_id)
);

create index idx_connections_influencer on connections(influencer_id);
create index idx_connections_client     on connections(client_id);

-- ── CAMPAIGNS ────────────────────────────────────────────────
create table campaigns (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  campaign_no   varchar unique not null,
  title         varchar not null,
  description   text,
  budget        decimal(12,2),
  type          campaign_type not null default 'draft',
  category      varchar,
  location      varchar,
  min_followers integer,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index idx_campaigns_client on campaigns(client_id);
create index idx_campaigns_type   on campaigns(type);

-- ── PROPOSALS ────────────────────────────────────────────────
create table proposals (
  id             uuid primary key default gen_random_uuid(),
  campaign_id    uuid not null references campaigns(id) on delete cascade,
  influencer_id  uuid not null references influencers(id) on delete cascade,
  budget         decimal(12,2) not null,
  delivery_days  integer,
  cover_letter   text,
  status         proposal_status not null default 'pending',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (campaign_id, influencer_id)    -- one proposal per influencer per campaign
);

create index idx_proposals_campaign   on proposals(campaign_id);
create index idx_proposals_influencer on proposals(influencer_id);

-- ── PORTFOLIOS (JSONB) ────────────────────────────────────────
create table portfolios (
  id            uuid primary key default gen_random_uuid(),
  influencer_id uuid not null references influencers(id) on delete cascade,
  sm_type       varchar not null,   -- instagram | tiktok | youtube | twitter
  handle        varchar,
  profile_url   varchar,
  fields        jsonb not null default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (influencer_id, sm_type)
);

create index idx_portfolios_influencer on portfolios(influencer_id);
create index idx_portfolios_fields     on portfolios using gin(fields);

-- ── MESSAGES (JSONB attachment) ───────────────────────────────
create table messages (
  id            uuid primary key default gen_random_uuid(),
  connection_id uuid not null references connections(id) on delete cascade,
  sender_id     uuid not null,
  sender_role   varchar not null check (sender_role in ('influencer','client')),
  type          message_type not null default 'text',
  content       text,
  attachment    jsonb,
  sent_at       timestamptz default now(),
  read_at       timestamptz
);

create index idx_messages_connection on messages(connection_id);
create index idx_messages_sent       on messages(connection_id, sent_at desc);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_influencers_updated before update on influencers for each row execute function update_updated_at();
create trigger trg_clients_updated     before update on clients     for each row execute function update_updated_at();
create trigger trg_campaigns_updated   before update on campaigns   for each row execute function update_updated_at();
create trigger trg_proposals_updated   before update on proposals   for each row execute function update_updated_at();
create trigger trg_portfolios_updated  before update on portfolios  for each row execute function update_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
alter table influencers  enable row level security;
alter table clients      enable row level security;
alter table connections  enable row level security;
alter table campaigns    enable row level security;
alter table proposals    enable row level security;
alter table portfolios   enable row level security;
alter table messages     enable row level security;

-- Influencers: can read all, can only write own row
create policy "influencers_select_all"  on influencers for select using (true);
create policy "influencers_update_own"  on influencers for update using (auth.uid() = auth_user_id);

-- Clients: can read all, can only write own row
create policy "clients_select_all"  on clients for select using (true);
create policy "clients_update_own"  on clients for update using (auth.uid() = auth_user_id);

-- Campaigns: anyone can read public ones; only owning client can write
create policy "campaigns_select_public" on campaigns for select using (type = 'public' or client_id in (select id from clients where auth_user_id = auth.uid()));
create policy "campaigns_insert_own"    on campaigns for insert with check (client_id in (select id from clients where auth_user_id = auth.uid()));
create policy "campaigns_update_own"    on campaigns for update using (client_id in (select id from clients where auth_user_id = auth.uid()));
create policy "campaigns_delete_own"    on campaigns for delete using (client_id in (select id from clients where auth_user_id = auth.uid()));

-- Proposals: influencer sees own; client sees proposals on their campaigns
create policy "proposals_influencer_own" on proposals for select using (influencer_id in (select id from influencers where auth_user_id = auth.uid()));
create policy "proposals_client_own"     on proposals for select using (campaign_id in (select id from campaigns where client_id in (select id from clients where auth_user_id = auth.uid())));
create policy "proposals_insert_own"     on proposals for insert with check (influencer_id in (select id from influencers where auth_user_id = auth.uid()));
create policy "proposals_update_own"     on proposals for update using (influencer_id in (select id from influencers where auth_user_id = auth.uid()) or campaign_id in (select id from campaigns where client_id in (select id from clients where auth_user_id = auth.uid())));

-- Connections: both parties can see their connections
create policy "connections_select" on connections for select using (
  influencer_id in (select id from influencers where auth_user_id = auth.uid()) or
  client_id in (select id from clients where auth_user_id = auth.uid())
);
create policy "connections_insert" on connections for insert with check (
  influencer_id in (select id from influencers where auth_user_id = auth.uid()) or
  client_id in (select id from clients where auth_user_id = auth.uid())
);
create policy "connections_update" on connections for update using (
  influencer_id in (select id from influencers where auth_user_id = auth.uid()) or
  client_id in (select id from clients where auth_user_id = auth.uid())
);

-- Portfolios: anyone can read; only owner can write
create policy "portfolios_select_all" on portfolios for select using (true);
create policy "portfolios_write_own"  on portfolios for all using (influencer_id in (select id from influencers where auth_user_id = auth.uid()));

-- Messages: only connection participants can read/write
create policy "messages_select" on messages for select using (
  connection_id in (
    select id from connections where
      influencer_id in (select id from influencers where auth_user_id = auth.uid()) or
      client_id in (select id from clients where auth_user_id = auth.uid())
  )
);
create policy "messages_insert" on messages for insert with check (
  connection_id in (
    select id from connections where
      influencer_id in (select id from influencers where auth_user_id = auth.uid()) or
      client_id in (select id from clients where auth_user_id = auth.uid())
  )
);
