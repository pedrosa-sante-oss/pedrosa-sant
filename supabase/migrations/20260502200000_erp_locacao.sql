-- ============================================================
-- ERP de Locação — Pedrosa Santé
-- Execute este SQL no Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Salas (com gestão de fotos via Storage)
create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  photo_url text,
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 2. Locadores (vinculados ao Supabase Auth via invite flow)
create table tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) unique,
  name text not null,
  email text not null unique,
  phone text,
  specialty text,
  active boolean default true,
  invite_token text unique default gen_random_uuid()::text,
  notes text,
  created_at timestamptz default now()
);

-- 3. Reservas
create table bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) not null,
  tenant_id uuid references tenants(id) not null,
  date date not null,
  period text not null check (period in ('manha', 'tarde', 'dia_todo')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  requested_by text not null default 'secretary' check (requested_by in ('tenant', 'secretary')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Contas bancárias
create table bank_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bank text,
  active boolean default true,
  created_at timestamptz default now()
);

-- 5. Recebimentos (vinculados a reservas)
create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id),
  amount numeric(10,2) not null,
  due_date date,
  paid_at date,
  bank_account_id uuid references bank_accounts(id),
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  notes text,
  created_at timestamptz default now()
);

-- 6. Despesas (para DRE)
create table expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text not null,
  amount numeric(10,2) not null,
  date date not null,
  bank_account_id uuid references bank_accounts(id),
  notes text,
  created_at timestamptz default now()
);

-- 7. Configurações do sistema
create table app_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- ============================================================
-- Helper: verifica se usuário logado é admin (não é locador)
-- ============================================================
create or replace function is_admin()
returns boolean language sql security definer as $$
  select not exists (select 1 from tenants where user_id = auth.uid());
$$;

-- ============================================================
-- RLS
-- ============================================================

-- rooms: leitura pública, escrita apenas admin
alter table rooms enable row level security;
create policy "rooms_public_read" on rooms for select using (true);
create policy "rooms_admin_all" on rooms for all using (is_admin()) with check (is_admin());

-- tenants: admin gerencia tudo; locador lê só o próprio registro
alter table tenants enable row level security;
create policy "tenants_admin_all" on tenants for all using (is_admin()) with check (is_admin());
create policy "tenants_own_read" on tenants for select using (user_id = auth.uid());
-- Permite que o próprio locador atualize seu user_id ao aceitar convite
create policy "tenants_accept_invite" on tenants for update
  using (invite_token is not null and user_id is null)
  with check (user_id = auth.uid());

-- bookings: admin tudo; locador lê/insere apenas suas reservas
alter table bookings enable row level security;
create policy "bookings_admin_all" on bookings for all using (is_admin()) with check (is_admin());
create policy "bookings_tenant_read" on bookings for select
  using (tenant_id = (select id from tenants where user_id = auth.uid()));
create policy "bookings_tenant_insert" on bookings for insert
  with check (tenant_id = (select id from tenants where user_id = auth.uid()));
create policy "bookings_tenant_cancel" on bookings for update
  using (
    tenant_id = (select id from tenants where user_id = auth.uid())
    and status = 'pending'
  )
  with check (status = 'cancelled');

-- Financeiro e configurações: apenas admin
alter table bank_accounts enable row level security;
create policy "bank_accounts_admin" on bank_accounts for all using (is_admin()) with check (is_admin());

alter table payments enable row level security;
create policy "payments_admin" on payments for all using (is_admin()) with check (is_admin());

alter table expenses enable row level security;
create policy "expenses_admin" on expenses for all using (is_admin()) with check (is_admin());

alter table app_settings enable row level security;
create policy "settings_admin" on app_settings for all using (is_admin()) with check (is_admin());

-- ============================================================
-- Seed: salas iniciais
-- ============================================================
insert into rooms (name, description, photo_url, sort_order) values
  ('Sala 01', 'Consultório clínico versátil para diversas especialidades de saúde.', '/renders/consultorio.jpg', 1),
  ('Sala 02', 'Consultório acolhedor para psicologia, nutrição e terapias.', '/renders/consultorio.jpg', 2),
  ('Sala 03', 'Consultório elegante para diversas especialidades de saúde.', '/renders/consultorio.jpg', 3),
  ('Sala Odontológica', 'Equipada com cadeira odontológica, compressor, refletor e sugador.', '/renders/sala-dentista.jpg', 4);

-- Seed: configurações padrão
insert into app_settings (key, value) values
  ('datacrazy_webhook_url', ''),
  ('datacrazy_api_key', ''),
  ('periodo_manha', '07:00–12:00'),
  ('periodo_tarde', '13:00–18:00');

-- ============================================================
-- Storage bucket (executar separado ou via Dashboard)
-- Criar bucket público "room-photos" em Storage > Buckets
-- ============================================================
