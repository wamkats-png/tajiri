-- Run this in your Supabase SQL Editor

-- Properties
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users,
  name text not null,
  address text,
  created_at timestamptz default now()
);

-- Units within a property
create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  unit_name text not null,
  status text default 'vacant',
  created_at timestamptz default now()
);

-- Tenants
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users,
  name text not null,
  phone text,
  national_id text,
  date_of_birth date,
  id_photo_url text,
  created_at timestamptz default now()
);

-- Leases
create table if not exists leases (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references units(id),
  tenant_id uuid references tenants(id),
  start_date date not null,
  end_date date,
  monthly_rent_ugx integer not null,
  status text default 'active',
  created_at timestamptz default now()
);

-- Payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid references leases(id),
  amount_ugx integer not null,
  month integer not null,
  year integer not null,
  paid_date date,
  method text,
  notes text,
  created_at timestamptz default now()
);

-- Storage bucket for ID photos (run in Storage tab or here)
-- insert into storage.buckets (id, name, public) values ('id-photos', 'id-photos', true);
