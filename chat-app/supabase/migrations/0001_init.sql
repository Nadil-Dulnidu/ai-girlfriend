-- =============================================================
-- AI Girlfriend Chat App - Initial Schema
-- =============================================================

-- conversations
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null default 'New chat',
  summary text not null default '',
  summarized_through timestamptz,
  created_at timestamptz not null default now()
);

create index idx_conversations_user on public.conversations (user_id, created_at desc);

-- messages (parts stored as JSONB, content as flattened text for search/summaries)
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  parts jsonb not null default '[]'::jsonb,
  content text not null default '',
  created_at timestamptz not null default now()
);

create index idx_messages_conversation on public.messages (conversation_id, created_at asc);

-- agent_settings (one row per user)
create table public.agent_settings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  girlfriend_name text not null default 'Aria',
  memories text not null default '',
  description text not null default 'A caring, warm, and witty AI companion who remembers everything about you.',
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Row Level Security
-- Assumes Clerk as third-party auth provider:
-- auth.jwt()->>'sub' returns the Clerk userId
-- =============================================================

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.agent_settings enable row level security;

-- conversations: owner-only CRUD
create policy "conversations_select" on public.conversations
  for select using ((auth.jwt() ->> 'sub') = user_id);

create policy "conversations_insert" on public.conversations
  for insert with check ((auth.jwt() ->> 'sub') = user_id);

create policy "conversations_update" on public.conversations
  for update using ((auth.jwt() ->> 'sub') = user_id);

create policy "conversations_delete" on public.conversations
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- messages: owner-only (via denormalized user_id)
create policy "messages_select" on public.messages
  for select using ((auth.jwt() ->> 'sub') = user_id);

create policy "messages_insert" on public.messages
  for insert with check ((auth.jwt() ->> 'sub') = user_id);

create policy "messages_delete" on public.messages
  for delete using ((auth.jwt() ->> 'sub') = user_id);

-- agent_settings: owner-only full access
create policy "settings_select" on public.agent_settings
  for select using ((auth.jwt() ->> 'sub') = user_id);

create policy "settings_insert" on public.agent_settings
  for insert with check ((auth.jwt() ->> 'sub') = user_id);

create policy "settings_update" on public.agent_settings
  for update using ((auth.jwt() ->> 'sub') = user_id);

create policy "settings_delete" on public.agent_settings
  for delete using ((auth.jwt() ->> 'sub') = user_id);
