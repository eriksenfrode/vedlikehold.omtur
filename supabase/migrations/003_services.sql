-- Omtur Vedlikehold – tjenestekategorier
-- Tabellprefiks: ov_

-- Tjenestekategorier
create table if not exists ov_services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0
);

-- Hvilke tjenester et verksted tilbyr (tom = tilbyr alt)
create table if not exists ov_workshop_services (
  workshop_id uuid references ov_workshops(id) on delete cascade,
  service_id uuid references ov_services(id) on delete cascade,
  primary key (workshop_id, service_id)
);

-- Hvilke tjenester brukeren ba om (lagres som array av service-navn)
alter table ov_inquiries add column if not exists services text[] default '{}';

create index if not exists ov_workshop_services_service_idx on ov_workshop_services (service_id);
create index if not exists ov_services_sort_order_idx on ov_services (sort_order);

-- Seed vanlige tjenester
insert into ov_services (name, sort_order) values
  ('Oljeskift / service', 1),
  ('Periodisk kontroll (EU-kontroll)', 2),
  ('Dekkskift / hjulskift', 3),
  ('Bremser', 4),
  ('Karosseri / lakk', 5)
on conflict (name) do nothing;
