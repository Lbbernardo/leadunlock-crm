-- ============================================================
-- LeadUnlock CRM — Migración: Categorías de leads
-- Correr en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabla de categorías disponibles
CREATE TABLE public.lead_categories (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN DEFAULT FALSE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías iniciales (solo las que Luis maneja actualmente)
INSERT INTO public.lead_categories (name, slug, description, is_active, sort_order) VALUES
  ('Gastos finales',        'final-expense',       'Seguros de gastos funerarios y vida',        TRUE,  1),
  ('Productos financieros', 'financial-products',  'Créditos, préstamos personales y PyME',      TRUE,  2),
  ('Seguros de vida',       'life-insurance',      'Pólizas de seguro de vida',                  FALSE, 3),
  ('Medicare / Medicaid',   'medicare',            'Planes Medicare y Medicaid',                 FALSE, 4),
  ('Seguros de auto',       'auto-insurance',      'Seguros vehiculares',                        FALSE, 5),
  ('Bienes raíces',         'real-estate',         'Compra, venta y renta de propiedades',       FALSE, 6);

-- Relación cliente ↔ categorías (many-to-many)
CREATE TABLE public.client_categories (
  client_id   UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.lead_categories(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (client_id, category_id)
);

-- Campo categoría en leads
ALTER TABLE public.leads
  ADD COLUMN category_id UUID REFERENCES public.lead_categories(id) ON DELETE SET NULL;

-- RLS: cualquiera puede leer categorías activas (necesario para el onboarding sin auth)
ALTER TABLE public.lead_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_select" ON public.lead_categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_admin_write"   ON public.lead_categories FOR ALL    USING (public.is_admin());

-- RLS: client_categories
ALTER TABLE public.client_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_categories_own_select" ON public.client_categories FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "client_categories_admin_all" ON public.client_categories FOR ALL USING (public.is_admin());
