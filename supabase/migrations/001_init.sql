-- Omtur Vedlikehold – initial schema
-- Tabellprefiks: ov_

-- Verksteder
create table if not exists ov_workshops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  city text not null default 'rana', -- 'rana' eller 'helgeland'
  active boolean not null default true,
  created_at timestamptz default now()
);

-- Bilmerker
create table if not exists ov_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique -- f.eks. 'Toyota', 'Volkswagen'
);

-- Hvilke merker et verksted tar imot (tom = tar alle merker)
create table if not exists ov_workshop_brands (
  workshop_id uuid references ov_workshops(id) on delete cascade,
  brand_id uuid references ov_brands(id) on delete cascade,
  primary key (workshop_id, brand_id)
);

-- Logg over innsendte anbud
create table if not exists ov_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  user_email text not null,
  reg_nr text not null,
  car_brand text,
  car_model text,
  car_year text,
  car_info jsonb,
  description text not null,
  workshops_notified int default 0,
  created_at timestamptz default now()
);

create index if not exists ov_workshops_city_active_idx on ov_workshops (city, active);
create index if not exists ov_workshop_brands_brand_idx on ov_workshop_brands (brand_id);
create index if not exists ov_inquiries_created_at_idx on ov_inquiries (created_at desc);
