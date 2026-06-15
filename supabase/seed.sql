-- Omtur Vedlikehold – seed-data for testing
-- Kjør etter 001_init.sql

-- Bilmerker (vanlige i Norge)
insert into ov_brands (name) values
  ('Toyota'),
  ('Volkswagen'),
  ('Volvo'),
  ('BMW'),
  ('Audi'),
  ('Mercedes-Benz'),
  ('Skoda'),
  ('Ford'),
  ('Nissan'),
  ('Hyundai'),
  ('Kia'),
  ('Tesla'),
  ('Peugeot'),
  ('Mazda'),
  ('Honda')
on conflict (name) do nothing;

-- Testverksteder i Rana
insert into ov_workshops (name, email, city, active) values
  ('Rana Bilverksted AS', 'post@ranabilverksted.example', 'rana', true),
  ('Mo Auto & Service', 'verksted@moauto.example', 'rana', true),
  ('Helgeland Bil & Dekk', 'kontakt@helgelandbil.example', 'rana', true),
  ('Nordland Motor', 'service@nordlandmotor.example', 'rana', true)
on conflict do nothing;

-- Koble merker til verksteder
-- Rana Bilverksted AS: spesialist på Toyota og Volkswagen
insert into ov_workshop_brands (workshop_id, brand_id)
select w.id, b.id
from ov_workshops w, ov_brands b
where w.name = 'Rana Bilverksted AS'
  and b.name in ('Toyota', 'Volkswagen', 'Skoda', 'Audi')
on conflict do nothing;

-- Mo Auto & Service: BMW, Mercedes, Audi
insert into ov_workshop_brands (workshop_id, brand_id)
select w.id, b.id
from ov_workshops w, ov_brands b
where w.name = 'Mo Auto & Service'
  and b.name in ('BMW', 'Mercedes-Benz', 'Audi')
on conflict do nothing;

-- Helgeland Bil & Dekk: Volvo, Ford, Nissan
insert into ov_workshop_brands (workshop_id, brand_id)
select w.id, b.id
from ov_workshops w, ov_brands b
where w.name = 'Helgeland Bil & Dekk'
  and b.name in ('Volvo', 'Ford', 'Nissan')
on conflict do nothing;

-- Nordland Motor: ingen merker registrert = universalverksted (tar alle merker)
