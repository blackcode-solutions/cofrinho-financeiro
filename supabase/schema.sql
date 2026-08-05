-- Cofrinho MVP Schema
-- Run in Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text,
  salary numeric(12,2) not null default 0,
  payday int not null default 1 check (payday between 1 and 31),
  save_goal_pct int not null default 30 check (save_goal_pct in (20, 25, 30)),
  objective text not null default 'Reserva',
  avatar_url text,
  level int not null default 1,
  xp int not null default 0,
  streak_days int not null default 0,
  last_active_date date,
  pig_stage text not null default 'baby'
    check (pig_stage in ('baby', 'golden', 'giant', 'castle', 'city')),
  onboarding_completed boolean not null default false,
  theme text not null default 'light' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Savings
create table if not exists public.savings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  transferred_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now()
);

-- Purchases
create table if not exists public.purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  description text not null,
  category text not null default 'Outros',
  decision text check (decision in ('need', 'wait', 'impulse')),
  status text not null default 'pending'
    check (status in ('pending', 'waiting', 'bought', 'avoided')),
  wait_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Credit cards
create table if not exists public.credit_cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Cartão',
  limit_amount numeric(12,2) not null check (limit_amount > 0),
  current_bill numeric(12,2) not null default 0 check (current_bill >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mission catalog
create table if not exists public.missions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  period text not null check (period in ('daily', 'weekly', 'monthly')),
  target_value numeric(12,2) not null default 1,
  xp_reward int not null default 50,
  icon text not null default 'target',
  active boolean not null default true
);

-- User missions
create table if not exists public.user_missions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  progress numeric(12,2) not null default 0,
  status text not null default 'active' check (status in ('active', 'completed', 'failed')),
  period_start date not null default current_date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, mission_id, period_start)
);

-- Achievements catalog
create table if not exists public.achievements (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  title text not null,
  description text not null,
  icon text not null default 'medal',
  xp_reward int not null default 100
);

-- User achievements
create table if not exists public.user_achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

-- City state
create table if not exists public.city_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  houses int not null default 0,
  trees int not null default 0,
  lakes int not null default 0,
  plazas int not null default 0,
  buildings int not null default 0,
  monuments int not null default 0,
  next_build_progress numeric(5,2) not null default 0,
  updated_at timestamptz not null default now()
);

-- Friendships
create table if not exists public.friendships (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

-- Notification prefs
create table if not exists public.notifications_prefs (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  payday boolean not null default true,
  wait_end boolean not null default true,
  mission boolean not null default true,
  card_alert boolean not null default true
);

-- Indexes
create index if not exists idx_savings_user on public.savings(user_id, transferred_at desc);
create index if not exists idx_purchases_user on public.purchases(user_id, created_at desc);
create index if not exists idx_user_missions_user on public.user_missions(user_id, status);

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  insert into public.city_state (user_id) values (new.id);
  insert into public.notifications_prefs (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated on public.profiles;
create trigger profiles_updated before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists purchases_updated on public.purchases;
create trigger purchases_updated before update on public.purchases
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.savings enable row level security;
alter table public.purchases enable row level security;
alter table public.credit_cards enable row level security;
alter table public.missions enable row level security;
alter table public.user_missions enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.city_state enable row level security;
alter table public.friendships enable row level security;
alter table public.notifications_prefs enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_friends" on public.profiles for select using (
  exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester_id = auth.uid() and f.addressee_id = id)
        or (f.addressee_id = auth.uid() and f.requester_id = id))
  )
);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Generic own-row policies
create policy "savings_all_own" on public.savings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "purchases_all_own" on public.purchases for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cards_all_own" on public.credit_cards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "missions_read" on public.missions for select using (true);
create policy "user_missions_all_own" on public.user_missions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "achievements_read" on public.achievements for select using (true);
create policy "user_achievements_all_own" on public.user_achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "city_all_own" on public.city_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "friends_select" on public.friendships for select using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "friends_insert" on public.friendships for insert with check (auth.uid() = requester_id);
create policy "friends_update" on public.friendships for update using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "notif_all_own" on public.notifications_prefs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seeds
insert into public.missions (title, description, period, target_value, xp_reward, icon) values
  ('Sem cartão hoje', 'Não use o cartão de crédito hoje', 'daily', 1, 40, 'credit-card'),
  ('Economize R$ 50', 'Guarde R$ 50 esta semana', 'weekly', 50, 80, 'piggy-bank'),
  ('3 dias sem delivery', 'Passe 3 dias sem pedir delivery', 'weekly', 3, 100, 'utensils'),
  ('Semana sem roupas', 'Não compre roupas por 7 dias', 'weekly', 7, 120, 'shirt'),
  ('Meta do mês', 'Bata sua meta de poupança mensal', 'monthly', 1, 200, 'trophy')
on conflict do nothing;

insert into public.achievements (code, title, description, icon, xp_reward) values
  ('first_save', 'Primeiro depósito', 'Guardou dinheiro pela primeira vez', 'coins', 50),
  ('wait_master', 'Mestre da espera', 'Completou 5 esperas de 24h', 'clock', 100),
  ('streak_7', 'Sequência de 7', '7 dias seguidos no app', 'flame', 150),
  ('streak_30', 'Disciplina de aço', '30 dias de sequência', 'flame', 300),
  ('save_30pct', 'Guardião dos 30%', 'Guardou 30% do salário no mês', 'medal', 200),
  ('city_starter', 'Fundador', 'Construiu o primeiro item na cidade', 'home', 80),
  ('impulse_blocker', 'Anti-impulso', 'Evitou 10 compras por impulso', 'shield', 180)
on conflict (code) do nothing;
