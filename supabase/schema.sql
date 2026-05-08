-- ============================================================
-- LeadUnlock CRM — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── TABLES ───────────────────────────────────────────────────

CREATE TABLE public.users (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email      TEXT NOT NULL,
  full_name  TEXT,
  role       TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.clients (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT,
  lead_price   DECIMAL(10,2) DEFAULT 20.00,
  balance      DECIMAL(10,2) DEFAULT 0.00,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.campaigns (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id  UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  source     TEXT,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.leads (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id        UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  campaign_id      UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  full_name        TEXT NOT NULL,
  phone            TEXT,
  email            TEXT,
  city             TEXT,
  state            TEXT,
  product_interest TEXT,
  source           TEXT,
  campaign_name    TEXT,
  is_locked        BOOLEAN DEFAULT TRUE,
  status           TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','interested','closed','not_interested')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.lead_unlocks (
  id                       UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id                  UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  client_id                UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  amount_paid              DECIMAL(10,2) NOT NULL DEFAULT 20.00,
  stripe_payment_intent_id TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, client_id)
);

CREATE TABLE public.invoices (
  id                       UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id                UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  amount                   DECIMAL(10,2) NOT NULL,
  status                   TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  stripe_payment_intent_id TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  paid_at                  TIMESTAMPTZ
);

CREATE TABLE public.invoice_items (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  lead_id    UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  description TEXT,
  amount     DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.payments (
  id                       UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id                UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_id               UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  amount                   DECIMAL(10,2) NOT NULL,
  status                   TEXT DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','refunded')),
  description              TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_unlocks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments      ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- users policies
CREATE POLICY "users_own_select"   ON public.users FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "users_admin_all"    ON public.users FOR ALL    USING (public.is_admin());

-- clients policies
CREATE POLICY "clients_own_select" ON public.clients FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "clients_admin_all"  ON public.clients FOR ALL    USING (public.is_admin());

-- leads policies
CREATE POLICY "leads_client_select" ON public.leads FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "leads_client_update" ON public.leads FOR UPDATE
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "leads_admin_all"     ON public.leads FOR ALL USING (public.is_admin());

-- lead_unlocks policies
CREATE POLICY "unlocks_client_select" ON public.lead_unlocks FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "unlocks_admin_all"     ON public.lead_unlocks FOR ALL USING (public.is_admin());

-- invoices / payments policies
CREATE POLICY "invoices_client_select" ON public.invoices FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "payments_client_select" ON public.payments FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()) OR public.is_admin());

-- ── FUNCTION: get_client_leads (masks locked data) ───────────

CREATE OR REPLACE FUNCTION public.get_client_leads(p_client_id UUID)
RETURNS TABLE (
  id               UUID,
  full_name        TEXT,
  phone            TEXT,
  email            TEXT,
  city             TEXT,
  state            TEXT,
  product_interest TEXT,
  source           TEXT,
  campaign_name    TEXT,
  is_locked        BOOLEAN,
  status           TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ,
  is_unlocked      BOOLEAN
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT public.is_admin() INTO v_is_admin;

  IF v_is_admin THEN
    RETURN QUERY
    SELECT l.id, l.full_name, l.phone, l.email, l.city, l.state,
           l.product_interest, l.source, l.campaign_name, l.is_locked,
           l.status, l.notes, l.created_at, TRUE::BOOLEAN
    FROM public.leads l
    WHERE l.client_id = p_client_id;
  ELSE
    -- Verify caller owns this client
    IF NOT EXISTS (
      SELECT 1 FROM public.clients WHERE id = p_client_id AND user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Unauthorized';
    END IF;

    RETURN QUERY
    SELECT
      l.id,
      l.full_name,
      CASE WHEN lu.id IS NOT NULL THEN l.phone ELSE NULL END,
      CASE WHEN lu.id IS NOT NULL THEN l.email ELSE NULL END,
      l.city,
      l.state,
      l.product_interest,
      l.source,
      l.campaign_name,
      l.is_locked,
      l.status,
      CASE WHEN lu.id IS NOT NULL THEN l.notes ELSE NULL END,
      l.created_at,
      (lu.id IS NOT NULL)::BOOLEAN
    FROM public.leads l
    LEFT JOIN public.lead_unlocks lu
      ON lu.lead_id = l.id AND lu.client_id = p_client_id
    WHERE l.client_id = p_client_id;
  END IF;
END;
$$;

-- ── TRIGGER: auto-create user profile on signup ───────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;

  IF COALESCE(NEW.raw_user_meta_data->>'role', 'client') = 'client' THEN
    INSERT INTO public.clients (user_id, company_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', ''))
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
