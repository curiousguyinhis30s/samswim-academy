-- SamSwim Academy - Initial Database Schema
-- Multi-tenant swimming academy SaaS

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. TENANTS TABLE
create table public.tenants (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text unique not null,
    settings jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. USERS TABLE
create table public.users (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    email text not null,
    name text not null,
    role text not null check (role in ('owner', 'coach', 'staff', 'parent')),
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(tenant_id, email)
);

-- 3. STUDENTS TABLE
create table public.students (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    parent_id uuid references public.users(id) on delete set null,
    name text not null,
    dob date not null,
    level text not null default 'beginner',
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. SCHEDULES TABLE
create table public.schedules (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    name text not null,
    day_of_week int not null check (day_of_week >= 0 and day_of_week <= 6),
    start_time time not null,
    end_time time not null,
    capacity int not null default 10,
    coach_id uuid references public.users(id) on delete set null,
    level text not null default 'beginner',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. BOOKINGS TABLE
create table public.bookings (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    schedule_id uuid references public.schedules(id) on delete cascade not null,
    student_id uuid references public.students(id) on delete cascade not null,
    date date not null,
    status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ATTENDANCE TABLE
create table public.attendance (
    id uuid primary key default uuid_generate_v4(),
    booking_id uuid references public.bookings(id) on delete cascade not null,
    checked_in_at timestamp with time zone default timezone('utc'::text, now()) not null,
    notes text
);

-- 7. PAYMENTS TABLE
create table public.payments (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    student_id uuid references public.students(id) on delete cascade not null,
    amount decimal(10,2) not null,
    currency text not null default 'MYR',
    status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
    payment_method text,
    reference text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INDEXES FOR PERFORMANCE
create index idx_users_tenant on public.users(tenant_id);
create index idx_users_email on public.users(email);
create index idx_students_tenant on public.students(tenant_id);
create index idx_students_parent on public.students(parent_id);
create index idx_schedules_tenant on public.schedules(tenant_id);
create index idx_schedules_day on public.schedules(day_of_week);
create index idx_bookings_tenant on public.bookings(tenant_id);
create index idx_bookings_student on public.bookings(student_id);
create index idx_bookings_schedule on public.bookings(schedule_id);
create index idx_bookings_date on public.bookings(date);
create index idx_attendance_booking on public.attendance(booking_id);
create index idx_payments_tenant on public.payments(tenant_id);
create index idx_payments_student on public.payments(student_id);

-- RLS (ROW LEVEL SECURITY) ENABLEMENT
alter table public.tenants enable row level security;
alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.schedules enable row level security;
alter table public.bookings enable row level security;
alter table public.attendance enable row level security;
alter table public.payments enable row level security;

-- HELPER FUNCTION: Get Tenant ID for current session user
create or replace function public.get_current_tenant_id()
returns uuid as $$
  select tenant_id from public.users where id = auth.uid();
$$ language sql stable security definer;

-- HELPER FUNCTION: Check if current user has specific role
create or replace function public.has_role(required_role text)
returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = required_role
  );
$$ language sql stable security definer;

-- RLS POLICIES FOR TENANT ISOLATION
create policy "tenant_isolation_users" on public.users
    for all using (tenant_id = public.get_current_tenant_id());

create policy "tenant_isolation_students" on public.students
    for all using (tenant_id = public.get_current_tenant_id());

create policy "tenant_isolation_schedules" on public.schedules
    for all using (tenant_id = public.get_current_tenant_id());

create policy "tenant_isolation_bookings" on public.bookings
    for all using (tenant_id = public.get_current_tenant_id());

create policy "tenant_isolation_payments" on public.payments
    for all using (tenant_id = public.get_current_tenant_id());

-- Parents can only see their own children
create policy "parents_view_own_children" on public.students
    for select using (parent_id = auth.uid());
