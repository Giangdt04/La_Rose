-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ====== TYPES (create only if not exists) ======
do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status as enum ('pending','reserved','confirmed','checked_in','completed','canceled','failed');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('initiated','pending','succeeded','failed','refunded');
  end if;
end$$;

-- ====== PROFILES (link to supabase auth.users) ======
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  is_verified boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

-- ====== ROLES & RBAC ======
create table if not exists roles (
  id serial primary key,
  name text not null unique,
  description text
);

create table if not exists role_permissions (
  id serial primary key,
  role_id int references roles(id) on delete cascade,
  resource text not null,
  permission text not null,
  unique (role_id, resource, permission)
);

create table if not exists user_roles (
  id serial primary key,
  user_id uuid references profiles(id) on delete cascade,
  role_id int references roles(id) on delete cascade,
  assigned_at timestamptz default now(),
  unique(user_id, role_id)
);

-- ====== ROOMS, MEDIA, AMENITIES ======
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  capacity int not null default 1,
  base_price numeric(12,2) not null default 0,
  currency text not null default 'VND',
  status text not null default 'active',
  metadata jsonb default '{}'::jsonb,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists trg_rooms_updated_at on rooms;
create trigger trg_rooms_updated_at
before update on rooms
for each row execute function set_updated_at();

create table if not exists room_media (
  id serial primary key,
  room_id uuid references rooms(id) on delete cascade,
  url text not null,
  type text default 'image',
  "order" int default 0
);

create table if not exists amenities (
  id serial primary key,
  name text not null unique
);

create table if not exists room_amenities (
  id serial primary key,
  room_id uuid references rooms(id) on delete cascade,
  amenity_id int references amenities(id) on delete cascade,
  unique(room_id, amenity_id)
);

-- ====== ROOM AVAILABILITY (calendar) ======
create table if not exists room_availability (
  id serial primary key,
  room_id uuid references rooms(id) on delete cascade,
  date date not null,
  status text not null default 'available', -- available, blocked, booked
  price_override numeric(12,2),
  note text,
  unique(room_id, date)
);

create index if not exists idx_room_availability_room_date on room_availability(room_id, date);

-- ====== BOOKINGS & STATE HISTORY ======
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  user_id uuid references profiles(id),
  room_id uuid references rooms(id),
  start_date date not null,
  end_date date not null,
  guests int not null default 1,
  night_count int not null,
  total_amount numeric(12,2) not null,
  currency text not null default 'VND',
  status booking_status not null default 'pending',
  hold_expires_at timestamptz,
  cancellation_reason text,
  canceled_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_bookings_room_dates on bookings(room_id, start_date, end_date);
create index if not exists idx_bookings_user on bookings(user_id);

create table if not exists booking_state_history (
  id serial primary key,
  booking_id uuid references bookings(id) on delete cascade,
  prev_status booking_status,
  new_status booking_status,
  changed_by uuid references profiles(id),
  reason text,
  created_at timestamptz default now()
);

-- ====== PAYMENTS ======
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete set null,
  provider text not null,
  provider_data jsonb default '{}'::jsonb,
  amount numeric(12,2) not null,
  currency text not null default 'VND',
  status payment_status not null default 'initiated',
  provider_payment_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_payments_booking on payments(booking_id);

-- ====== REVIEWS ======
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  photos jsonb default '[]'::jsonb,
  is_visible boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_reviews_room on reviews(room_id);

-- ====== NOTIFICATIONS ======
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  channel text not null,
  template text,
  payload jsonb default '{}'::jsonb,
  status text default 'pending',
  attempts int default 0,
  last_error text,
  scheduled_at timestamptz default now(),
  sent_at timestamptz
);

-- ====== CHAT: CONVERSATIONS & MESSAGES ======
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  subject text,
  user_id uuid references profiles(id),
  assigned_agent uuid references profiles(id),
  status text default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists trg_conversations_updated_at on conversations;
create trigger trg_conversations_updated_at
before update on conversations
for each row execute function set_updated_at();

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id),
  content text,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- ====== AUDIT LOG ======
create table if not exists audit_logs (
  id serial primary key,
  actor_id uuid references profiles(id),
  action text not null,
  entity text,
  entity_id text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ====== HELPER: CHECK BOOKING OVERLAP FUNCTION ======
create or replace function fn_check_booking_overlap(p_room uuid, p_start date, p_end date, p_ignore_booking uuid)
returns boolean language plpgsql as $$
declare cnt int;
begin
  select count(*) into cnt
  from bookings b
  where b.room_id = p_room
    and (p_ignore_booking is null or b.id != p_ignore_booking)
    and b.status in ('reserved','confirmed','checked_in')
    and not (b.end_date <= p_start or b.start_date >= p_end);
  return cnt = 0;
end;
$$;

-- ====== TRIGGER: PREVENT OVERLAP WHEN SETTING RESERVED/CONFIRMED ======
create or replace function trg_bookings_prevent_overlap()
returns trigger language plpgsql as $$
begin
  if (NEW.status in ('reserved','confirmed')) then
    if not fn_check_booking_overlap(NEW.room_id, NEW.start_date, NEW.end_date, NEW.id) then
      raise exception 'Room % is already booked for the given dates', NEW.room_id;
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists tgr_bookings_check_overlap on bookings;
create trigger tgr_bookings_check_overlap
before insert or update on bookings
for each row execute function trg_bookings_prevent_overlap();

-- ====== TRIGGER: AUDIT CHANGES ======
create or replace function audit_changes() returns trigger language plpgsql as $$
declare subj text;
begin
  begin
    subj := current_setting('request.jwt.claims.sub', true);
  exception when others then
    subj := null;
  end;

  insert into audit_logs(actor_id, action, entity, entity_id, payload, created_at)
  values (
    case when subj is not null then subj::uuid else null end,
    TG_OP,
    TG_TABLE_NAME,
    coalesce(
      case when NEW is not null then (NEW.*)::json->>'id' else null end,
      case when OLD is not null then (OLD.*)::json->>'id' else null end
    ),
    row_to_json(coalesce(NEW, OLD))::jsonb,
    now()
  );
  return NEW;
end;
$$;

drop trigger if exists tgr_audit_bookings on bookings;
create trigger tgr_audit_bookings
after insert or update or delete on bookings
for each row execute function audit_changes();

drop trigger if exists tgr_audit_rooms on rooms;
create trigger tgr_audit_rooms
after insert or update or delete on rooms
for each row execute function audit_changes();

drop trigger if exists tgr_audit_profiles on profiles;
create trigger tgr_audit_profiles
after insert or update or delete on profiles
for each row execute function audit_changes();

-- ====== MATERIALIZED VIEW: MONTHLY OCCUPANCY (example) ======
create materialized view if not exists mv_monthly_occupancy as
select
  r.id as room_id,
  date_trunc('month', b.start_date)::date as month,
  sum((b.end_date - b.start_date)) as booked_nights,
  count(b.id) as bookings_count
from bookings b
join rooms r on r.id = b.room_id
where b.status in ('confirmed','checked_in','completed')
group by r.id, date_trunc('month', b.start_date);

-- ====== SAMPLE INDEXES FOR PERFORMANCE ======
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_payments_provider_payment_id on payments(provider_payment_id);

-- ====== SAMPLE TRIGGER/CRON SKETCH TO CLEAN EXPIRED HOLDS ======
-- Use Supabase scheduled functions or pg_cron to run:
-- update bookings set status='canceled', cancellation_reason='hold_expired', updated_at=now()
-- where status='pending' and hold_expires_at < now();

-- ====== RLS (Row Level Security) SAMPLES for bookings, payments, conversations, messages ======
-- WARNING: Adjust claim keys and role logic per your JWT claims setup in Supabase.

-- Enable RLS where appropriate
alter table if exists bookings enable row level security;
alter table if exists payments enable row level security;
alter table if exists conversations enable row level security;
alter table if exists messages enable row level security;
alter table if exists profiles enable row level security;

-- POLICY: owner can do all on their bookings
drop policy if exists bookings_is_owner on bookings;
create policy bookings_is_owner on bookings
  for all
  using ( user_id = current_setting('request.jwt.claims.sub')::uuid )
  with check ( user_id = current_setting('request.jwt.claims.sub')::uuid );

-- POLICY: admins (JWT claim 'role'='admin' or 'superadmin') can bypass
drop policy if exists bookings_admins on bookings;
create policy bookings_admins on bookings
  for all
  using ( current_setting('request.jwt.claims.role', true) = 'admin' or current_setting('request.jwt.claims.role', true) = 'superadmin' )
  with check ( current_setting('request.jwt.claims.role', true) = 'admin' or current_setting('request.jwt.claims.role', true) = 'superadmin' );

-- Payments policies: owner if related booking belongs to user OR admin
create or replace view vw_user_payments as
select p.*
from payments p
left join bookings b on b.id = p.booking_id
where b.user_id = current_setting('request.jwt.claims.sub')::uuid;

drop policy if exists payments_is_owner on payments;
create policy payments_is_owner on payments
  for select
  using ( exists (select 1 from bookings b where b.id = payments.booking_id and b.user_id = current_setting('request.jwt.claims.sub')::uuid) );

drop policy if exists payments_admins on payments;
create policy payments_admins on payments
  for all
  using ( current_setting('request.jwt.claims.role', true) = 'admin' or current_setting('request.jwt.claims.role', true) = 'superadmin' )
  with check ( current_setting('request.jwt.claims.role', true) = 'admin' or current_setting('request.jwt.claims.role', true) = 'superadmin' );

-- Conversations/messages policies: owner or agent or admin
drop policy if exists conversations_owner_or_agent on conversations;
create policy conversations_owner_or_agent on conversations
  for all
  using (
    user_id = current_setting('request.jwt.claims.sub')::uuid
    or assigned_agent = current_setting('request.jwt.claims.sub')::uuid
    or current_setting('request.jwt.claims.role', true) in ('admin','superadmin')
  )
  with check (
    user_id = current_setting('request.jwt.claims.sub')::uuid
    or assigned_agent = current_setting('request.jwt.claims.sub')::uuid
    or current_setting('request.jwt.claims.role', true) in ('admin','superadmin')
  );

drop policy if exists messages_owner_or_agent on messages;
create policy messages_owner_or_agent on messages
  for all
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (
          c.user_id = current_setting('request.jwt.claims.sub')::uuid
          or c.assigned_agent = current_setting('request.jwt.claims.sub')::uuid
        )
    )
    or current_setting('request.jwt.claims.role', true) in ('admin','superadmin')
  )
  with check (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (
          c.user_id = current_setting('request.jwt.claims.sub')::uuid
          or c.assigned_agent = current_setting('request.jwt.claims.sub')::uuid
        )
    )
    or current_setting('request.jwt.claims.role', true) in ('admin','superadmin')
  );

-- Profiles: allow users to select/update their own profile, admins can manage
drop policy if exists profiles_is_owner on profiles;
create policy profiles_is_owner on profiles
  for all
  using ( id = current_setting('request.jwt.claims.sub')::uuid )
  with check ( id = current_setting('request.jwt.claims.sub')::uuid );

drop policy if exists profiles_admins on profiles;
create policy profiles_admins on profiles
  for all
  using ( current_setting('request.jwt.claims.role', true) in ('admin','superadmin') )
  with check ( current_setting('request.jwt.claims.role', true) in ('admin','superadmin') );

-- ====== UTILITY: ensure required roles exist (seed) ======
insert into roles(name, description) values
  ('superadmin','Full access'),
  ('admin','Admin access'),
  ('staff','Support staff'),
  ('user','End user')
on conflict (name) do nothing;
