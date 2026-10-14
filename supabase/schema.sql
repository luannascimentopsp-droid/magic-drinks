-- Magic Drinks: isolated tables for a separate Supabase project.
-- Run only in the dedicated Magic Drinks project, not in Metal & Forma or Barbearia.
create extension if not exists pgcrypto;

create table if not exists public.md_owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.md_is_owner()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.md_owners where user_id = auth.uid());
$$;

create table if not exists public.md_quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_name text not null,
  client_phone text not null,
  event_date date not null,
  bar_start_time time not null,
  event_type text not null,
  guest_count integer not null check (guest_count > 0),
  city text not null,
  venue text not null,
  other_beverages text not null,
  glassware text not null,
  drink_styles text[] not null default '{}',
  selected_drinks jsonb not null default '[]'::jsonb,
  selected_fruits text[] not null default '{}',
  referral_source text not null,
  notes text,
  status text not null default 'new' check (status in ('new','contacted','quoted','confirmed','completed','cancelled'))
);

create table if not exists public.md_events (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid unique references public.md_quote_requests(id) on delete set null,
  created_at timestamptz not null default now(),
  event_date date not null,
  client_name text not null,
  client_phone text not null,
  event_type text not null,
  guest_count integer not null default 1 check (guest_count > 0),
  city text not null,
  venue text not null,
  start_time time,
  status text not null default 'confirmed' check (status in ('confirmed','completed','cancelled')),
  budget_amount numeric(12,2) not null default 0 check (budget_amount >= 0),
  adjustment_amount numeric(12,2) not null default 0,
  deposit_received numeric(12,2) not null default 0 check (deposit_received >= 0),
  cost_beverages numeric(12,2) not null default 0 check (cost_beverages >= 0),
  cost_disposables numeric(12,2) not null default 0 check (cost_disposables >= 0),
  cost_fruits numeric(12,2) not null default 0 check (cost_fruits >= 0),
  cost_ice numeric(12,2) not null default 0 check (cost_ice >= 0),
  cost_extra numeric(12,2) not null default 0 check (cost_extra >= 0),
  cost_labor numeric(12,2) not null default 0 check (cost_labor >= 0),
  cost_fuel numeric(12,2) not null default 0 check (cost_fuel >= 0),
  notes text
);

create table if not exists public.md_reminders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.md_events(id) on delete cascade,
  title text not null,
  due_at timestamptz not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace view public.md_event_finance with (security_invoker = true) as
select e.*,
  (e.cost_beverages + e.cost_disposables + e.cost_fruits + e.cost_ice + e.cost_extra + e.cost_labor + e.cost_fuel) as total_costs,
  (e.budget_amount + e.adjustment_amount) as final_amount,
  greatest(e.budget_amount + e.adjustment_amount - e.deposit_received, 0) as amount_due,
  (e.budget_amount + e.adjustment_amount - e.cost_beverages - e.cost_disposables - e.cost_fruits - e.cost_ice - e.cost_extra - e.cost_labor - e.cost_fuel) as net_amount
from public.md_events e;

alter table public.md_owners enable row level security;
alter table public.md_quote_requests enable row level security;
alter table public.md_events enable row level security;
alter table public.md_reminders enable row level security;

drop policy if exists "md_owner reads own access" on public.md_owners;
create policy "md_owner reads own access" on public.md_owners
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "public can request a quote" on public.md_quote_requests;
create policy "public can request a quote" on public.md_quote_requests
  for insert to anon, authenticated with check (
    length(trim(client_name)) between 2 and 120
    and length(regexp_replace(client_phone, '[^0-9]', '', 'g')) between 10 and 15
    and guest_count between 1 and 10000
      and status = 'new'
    and jsonb_typeof(selected_drinks) = 'array'
  );
drop policy if exists "owner reads quote requests" on public.md_quote_requests;
create policy "owner reads quote requests" on public.md_quote_requests
  for select to authenticated using (public.md_is_owner());
drop policy if exists "owner updates quote requests" on public.md_quote_requests;
create policy "owner updates quote requests" on public.md_quote_requests
  for update to authenticated using (public.md_is_owner()) with check (public.md_is_owner());

drop policy if exists "owner manages events" on public.md_events;
create policy "owner manages events" on public.md_events
  for all to authenticated using (public.md_is_owner()) with check (public.md_is_owner());
drop policy if exists "owner manages reminders" on public.md_reminders;
create policy "owner manages reminders" on public.md_reminders
  for all to authenticated using (public.md_is_owner()) with check (public.md_is_owner());

grant usage on schema public to anon, authenticated;
grant insert on public.md_quote_requests to anon, authenticated;
grant select, update on public.md_quote_requests to authenticated;
grant select on public.md_owners to authenticated;
grant select, insert, update, delete on public.md_events, public.md_reminders to authenticated;
grant select on public.md_event_finance to authenticated;

-- After creating the owner account through Supabase Auth, authorize it with:
-- insert into public.md_owners (user_id, email)
-- select id, email from auth.users where lower(email) = lower('OWNER_EMAIL');
