-- Migration: Multi-branch management schema for SamSwim Academy
-- File: src/db/migrations/002_branches.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    operating_hours JSONB DEFAULT '{}'::jsonb,
    capacity INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Branch Staff Linking Table
CREATE TABLE IF NOT EXISTS branch_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(branch_id, user_id)
);

-- 3. Create Branch Settings Table
CREATE TABLE IF NOT EXISTS branch_settings (
    branch_id UUID PRIMARY KEY REFERENCES branches(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Modify Existing Tables

-- Add preferred_branch to students
ALTER TABLE students
ADD COLUMN IF NOT EXISTS preferred_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Modify Schedules to link to branches
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE CASCADE;

-- 5. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_branches_tenant_id ON branches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_branches_status ON branches(status);
CREATE INDEX IF NOT EXISTS idx_branch_staff_branch_id ON branch_staff(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_staff_user_id ON branch_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_students_preferred_branch_id ON students(preferred_branch_id);
CREATE INDEX IF NOT EXISTS idx_bookings_branch_id ON bookings(branch_id);
CREATE INDEX IF NOT EXISTS idx_schedules_branch_id ON schedules(branch_id);

-- 6. Row Level Security (RLS) Updates

-- Branches Policies
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_branches" ON branches
    FOR ALL USING (tenant_id = public.get_current_tenant_id());

-- Branch Staff Policies
ALTER TABLE branch_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_branch_staff_via_tenant" ON branch_staff
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM branches
            WHERE branches.id = branch_staff.branch_id
            AND branches.tenant_id = public.get_current_tenant_id()
        )
    );

-- 7. Additional Helper Tables

-- Booking Credits Table (for tracking paid lesson credits)
CREATE TABLE IF NOT EXISTS booking_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL DEFAULT 0,
    payment_id UUID,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_credits_student ON booking_credits(student_id);
CREATE INDEX IF NOT EXISTS idx_booking_credits_tenant ON booking_credits(tenant_id);

ALTER TABLE booking_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_booking_credits" ON booking_credits
    FOR ALL USING (tenant_id = public.get_current_tenant_id());

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    subscription_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    plan_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_student ON subscriptions(student_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_subscriptions" ON subscriptions
    FOR ALL USING (tenant_id = public.get_current_tenant_id());

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant ON activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_activity_logs" ON activity_logs
    FOR ALL USING (tenant_id = public.get_current_tenant_id());
