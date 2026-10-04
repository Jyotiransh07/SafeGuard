-- ==============================================================================
-- AEA (Assistive Emergency Alert) / SafeGuard Pro - Supabase Complete Schema
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
do $$ begin
  create type incident_status as enum ('countdown', 'active', 'resolved', 'cancelled');
exception
  when duplicate_object then null;
end $$;

-- 3. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default 'Emergency User',
  email text,
  phone text,
  avatar_url text default 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. MEDICAL CARDS (CRITICAL DIRECTIVES)
create table if not exists public.medical_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  blood_group text default 'O+',
  age int default 29,
  organ_donor boolean default true,
  allergies text[] default '{"Penicillin"}',
  medical_conditions text default 'Mild Asthma, carries inhaler.',
  paramedic_instructions text default 'Check backpack for inhaler if unresponsive.',
  updated_at timestamptz default now()
);

-- 5. USER SETTINGS & ACCESSIBILITY
create table if not exists public.user_settings (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  countdown_seconds int default 5,
  fall_detection boolean default true,
  silent_mode boolean default false,
  high_contrast boolean default false,
  large_text boolean default false,
  large_buttons boolean default false,
  reduce_motion boolean default false,
  updated_at timestamptz default now()
);

-- 6. TRUSTED EMERGENCY CONTACTS
create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  relation text not null default 'Family',
  phone text not null,
  priority int not null default 1,
  methods text[] default '{"SMS", "Call"}',
  created_at timestamptz default now()
);

-- 7. EMERGENCY INCIDENTS (SOS EVENTS)
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  status incident_status default 'countdown',
  trigger_method text default 'manual_button', -- 'manual_button', 'fall_detection', 'voice'
  share_token uuid default gen_random_uuid() not null,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- 8. LIVE GPS TELEMETRY
create table if not exists public.incident_locations (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references public.incidents(id) on delete cascade not null,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_meters double precision default 5.0,
  battery_level int default 89,
  recorded_at timestamptz default now()
);

-- 9. INCIDENT MESSAGES (QUICK UPDATES)
create table if not exists public.incident_messages (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references public.incidents(id) on delete cascade not null,
  message text not null,
  sent_at timestamptz default now()
);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Emergency User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', '')
  );

  insert into public.medical_cards (user_id)
  values (new.id);

  insert into public.user_settings (user_id)
  values (new.id);

  -- Seed default contact for testing
  insert into public.emergency_contacts (user_id, name, relation, phone, priority, methods)
  values 
    (new.id, 'Primary Contact (Family)', 'Family', '+1 (555) 019-2831', 1, '{"SMS", "Call"}'),
    (new.id, 'Emergency Physician', 'Doctor', '+1 (555) 014-9922', 2, '{"SMS"}');

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.medical_cards enable row level security;
alter table public.user_settings enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_locations enable row level security;
alter table public.incident_messages enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Medical Cards
create policy "Users can view own medical card" on public.medical_cards for select using (auth.uid() = user_id);
create policy "Users can update own medical card" on public.medical_cards for update using (auth.uid() = user_id);
create policy "Users can insert own medical card" on public.medical_cards for insert with check (auth.uid() = user_id);

-- User Settings
create policy "Users can view own settings" on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can update own settings" on public.user_settings for update using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.user_settings for insert with check (auth.uid() = user_id);

-- Emergency Contacts
create policy "Users can manage own contacts" on public.emergency_contacts for all using (auth.uid() = user_id);

-- Incidents
create policy "Users can manage own incidents" on public.incidents for all using (auth.uid() = user_id);
create policy "Public can view incident via token" on public.incidents for select using (true);

-- Incident Locations
create policy "Users can insert locations" on public.incident_locations for insert with check (
  exists (select 1 from public.incidents where id = incident_id and user_id = auth.uid())
);
create policy "Public can view locations of incident" on public.incident_locations for select using (true);

-- Incident Messages
create policy "Users can manage messages" on public.incident_messages for all using (
  exists (select 1 from public.incidents where id = incident_id and user_id = auth.uid())
);
create policy "Public can view messages of incident" on public.incident_messages for select using (true);

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- ==============================================================================
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.incidents;
alter publication supabase_realtime add table public.incident_locations;
alter publication supabase_realtime add table public.incident_messages;
