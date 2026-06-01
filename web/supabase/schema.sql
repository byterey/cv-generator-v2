-- now-cv database schema
-- Run this in the Supabase SQL editor to set up all tables and RLS policies.

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.cvs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null default 'My CV',
  data         jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.user_credits (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  credits_remaining   int not null default 5,
  credits_used_total  int not null default 0,
  reset_at            timestamptz not null default date_trunc('month', now()) + interval '1 month'
);

create table if not exists public.usage_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  action       text not null,
  tokens_used  int not null default 0,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists cvs_user_id_idx        on public.cvs(user_id);
create index if not exists usage_logs_user_id_idx on public.usage_logs(user_id);

-- ============================================================
-- updated_at trigger for cvs
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cvs_set_updated_at on public.cvs;
create trigger cvs_set_updated_at
  before update on public.cvs
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.cvs          enable row level security;
alter table public.user_credits enable row level security;
alter table public.usage_logs   enable row level security;

-- cvs: users can only access their own rows
create policy "cvs: owner select" on public.cvs
  for select using (auth.uid() = user_id);

create policy "cvs: owner insert" on public.cvs
  for insert with check (auth.uid() = user_id);

create policy "cvs: owner update" on public.cvs
  for update using (auth.uid() = user_id);

create policy "cvs: owner delete" on public.cvs
  for delete using (auth.uid() = user_id);

-- user_credits: users can read their own row; writes via service role only
create policy "user_credits: owner select" on public.user_credits
  for select using (auth.uid() = user_id);

-- usage_logs: users can read their own logs; inserts via service role only
create policy "usage_logs: owner select" on public.usage_logs
  for select using (auth.uid() = user_id);

-- ============================================================
-- Credit init + monthly reset RPC (called server-side)
-- ============================================================

create or replace function public.ensure_user_credits(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into public.user_credits (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  -- Reset if reset_at has passed (idempotent)
  update public.user_credits
  set
    credits_remaining  = 5,
    credits_used_total = credits_used_total,
    reset_at           = date_trunc('month', now()) + interval '1 month'
  where user_id = p_user_id
    and now() >= reset_at;
end;
$$;

-- ============================================================
-- Atomic credit deduction RPC (called server-side)
-- ============================================================

create or replace function public.deduct_credit(p_user_id uuid)
returns boolean language plpgsql security definer as $$
declare
  v_remaining int;
begin
  -- Ensure row exists and reset if needed
  perform public.ensure_user_credits(p_user_id);

  select credits_remaining into v_remaining
  from public.user_credits
  where user_id = p_user_id
  for update;

  if v_remaining <= 0 then
    return false;
  end if;

  update public.user_credits
  set
    credits_remaining  = credits_remaining - 1,
    credits_used_total = credits_used_total + 1
  where user_id = p_user_id;

  return true;
end;
$$;
