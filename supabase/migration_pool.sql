-- ============================================================
-- LeadUnlock CRM — Migración: Pool de leads
-- Los leads entran a un pool por categoría + estado. Los ven todos los
-- clientes que coinciden y el primero que paga se lo queda (exclusivo).
-- Precio: costo × 3 (mín $12) → 100% <24h, 60% <7 días, 30% después.
-- Correr en: Supabase Dashboard > SQL Editor (es seguro correrlo 2 veces)
-- ============================================================

-- ── 1. Columnas nuevas ───────────────────────────────────────
ALTER TABLE public.leads     ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE public.campaigns ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS category       TEXT,
  ADD COLUMN IF NOT EXISTS state_code     TEXT,
  ADD COLUMN IF NOT EXISTS zip_code       TEXT,
  ADD COLUMN IF NOT EXISTS meta_lead_id   TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS claimed_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reserved_by    UUID,
  ADD COLUMN IF NOT EXISTS reserved_until TIMESTAMPTZ;

-- Estado que se asigna a leads que llegan sin estado ni código postal
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS default_state TEXT;

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS pool_categories TEXT[],
  ADD COLUMN IF NOT EXISTS pool_states     TEXT[];

CREATE INDEX IF NOT EXISTS leads_pool_idx ON public.leads (category, state_code) WHERE client_id IS NULL;

-- ── 2. Estados (solo para migrar datos existentes) ───────────
CREATE TABLE IF NOT EXISTS public.us_states (code TEXT PRIMARY KEY, name TEXT NOT NULL);
ALTER TABLE public.us_states ENABLE ROW LEVEL SECURITY;
INSERT INTO public.us_states (code, name) VALUES
  ('AL','Alabama'), ('AK','Alaska'), ('AZ','Arizona'), ('AR','Arkansas'),
  ('CA','California'), ('CO','Colorado'), ('CT','Connecticut'), ('DE','Delaware'),
  ('DC','District of Columbia'), ('FL','Florida'), ('GA','Georgia'), ('HI','Hawaii'),
  ('ID','Idaho'), ('IL','Illinois'), ('IN','Indiana'), ('IA','Iowa'),
  ('KS','Kansas'), ('KY','Kentucky'), ('LA','Louisiana'), ('ME','Maine'),
  ('MD','Maryland'), ('MA','Massachusetts'), ('MI','Michigan'), ('MN','Minnesota'),
  ('MS','Mississippi'), ('MO','Missouri'), ('MT','Montana'), ('NE','Nebraska'),
  ('NV','Nevada'), ('NH','New Hampshire'), ('NJ','New Jersey'), ('NM','New Mexico'),
  ('NY','New York'), ('NC','North Carolina'), ('ND','North Dakota'), ('OH','Ohio'),
  ('OK','Oklahoma'), ('OR','Oregon'), ('PA','Pennsylvania'), ('RI','Rhode Island'),
  ('SC','South Carolina'), ('SD','South Dakota'), ('TN','Tennessee'), ('TX','Texas'),
  ('UT','Utah'), ('VT','Vermont'), ('VA','Virginia'), ('WA','Washington'),
  ('WV','West Virginia'), ('WI','Wisconsin'), ('WY','Wyoming'), ('PR','Puerto Rico')
ON CONFLICT (code) DO NOTHING;

-- ── 3. Migrar datos existentes ───────────────────────────────
-- Categoría del lead = categoría de su campaña
UPDATE public.leads l SET category = c.interest_category
FROM public.campaigns c
WHERE l.campaign_id = c.id AND l.category IS NULL AND c.interest_category IS NOT NULL;

-- Estado normalizado ("Florida" / "fl" → "FL")
UPDATE public.leads l SET state_code = s.code
FROM public.us_states s
WHERE l.state_code IS NULL AND (upper(trim(l.state)) = s.code OR lower(trim(l.state)) = lower(s.name));

-- Leads que ya se pagaron pero seguían marcados como bloqueados
UPDATE public.leads l SET is_locked = FALSE
WHERE l.is_locked AND EXISTS (SELECT 1 FROM public.lead_unlocks u WHERE u.lead_id = l.id);

-- Leads bloqueados que nadie pagó → al pool
UPDATE public.leads SET client_id = NULL WHERE is_locked AND client_id IS NOT NULL;

-- Preferencias del cliente a partir de su onboarding
UPDATE public.clients c SET pool_categories = CASE
    WHEN jsonb_typeof(to_jsonb(c.categories)) = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(to_jsonb(c.categories)))
    ELSE ARRAY[c.categories::TEXT]
  END
WHERE c.pool_categories IS NULL AND c.categories IS NOT NULL;

UPDATE public.clients c SET pool_states = (
    SELECT array_agg(s.code) FROM public.us_states s
    WHERE c.target_state ~ ('\m' || s.code || '\M') OR c.target_state ~* ('\m' || s.name || '\M')
  )
WHERE c.pool_states IS NULL AND c.target_state IS NOT NULL;

-- ── 4. Precio con descuento por antigüedad ───────────────────
CREATE OR REPLACE FUNCTION public.pool_price(p_cost NUMERIC, p_created TIMESTAMPTZ)
RETURNS INTEGER LANGUAGE sql STABLE AS $$
  SELECT GREATEST(1, ROUND(
    GREATEST(ROUND(COALESCE(p_cost, 0) * 3), 12) *
    CASE WHEN now() - p_created < INTERVAL '24 hours' THEN 1.0
         WHEN now() - p_created < INTERVAL '7 days'   THEN 0.6
         ELSE 0.3 END
  ))::INTEGER
$$;

-- ── 5. Lo que ve el cliente: sus leads + pool (datos ocultos) ─
DROP FUNCTION IF EXISTS public.get_pool_leads();
CREATE FUNCTION public.get_pool_leads()
RETURNS TABLE (
  id UUID, full_name TEXT, phone TEXT, email TEXT, city TEXT, state TEXT,
  category TEXT, product_interest TEXT, source TEXT, status TEXT, notes TEXT,
  created_at TIMESTAMPTZ, claimed_at TIMESTAMPTZ, is_unlocked BOOLEAN, price INTEGER
)
SECURITY DEFINER SET search_path = public LANGUAGE sql STABLE AS $$
  WITH me AS (
    SELECT c.id, c.pool_categories, c.pool_states FROM clients c
    WHERE c.user_id = auth.uid() LIMIT 1
  )
  SELECT l.id, l.full_name, l.phone, l.email, l.city, l.state,
         l.category, l.product_interest, l.source, l.status, l.notes,
         l.created_at, l.claimed_at, TRUE, NULL::INTEGER
  FROM leads l JOIN me ON l.client_id = me.id
  UNION ALL
  SELECT l.id,
         split_part(l.full_name, ' ', 1) ||
           COALESCE(' ' || left(NULLIF(split_part(l.full_name, ' ', 2), ''), 1) || '.', ''),
         NULL, NULL, l.city, COALESCE(l.state_code, l.state),
         l.category, l.product_interest, l.source, l.status, NULL,
         l.created_at, NULL, FALSE, pool_price(l.acquisition_cost, l.created_at)
  FROM leads l, me
  WHERE l.client_id IS NULL AND l.is_locked
    AND (cardinality(me.pool_categories) IS NULL OR cardinality(me.pool_categories) = 0 OR l.category = ANY(me.pool_categories))
    AND (cardinality(me.pool_states) IS NULL OR cardinality(me.pool_states) = 0 OR l.state_code = ANY(me.pool_states))
    AND (l.reserved_until IS NULL OR l.reserved_until < now() OR l.reserved_by = me.id)
$$;
GRANT EXECUTE ON FUNCTION public.get_pool_leads() TO authenticated;

-- El cliente cambia sus nichos y estados desde su perfil
CREATE OR REPLACE FUNCTION public.set_pool_preferences(p_categories TEXT[], p_states TEXT[])
RETURNS VOID SECURITY DEFINER SET search_path = public LANGUAGE sql AS $$
  UPDATE clients SET pool_categories = p_categories, pool_states = p_states
  WHERE user_id = auth.uid()
$$;
GRANT EXECUTE ON FUNCTION public.set_pool_preferences(TEXT[], TEXT[]) TO authenticated;

-- ── 6. Desbloqueo atómico (solo lo llaman las APIs) ──────────
-- Aparta el lead 2 min para este cliente. NULL = otro ya lo tomó.
CREATE OR REPLACE FUNCTION public.reserve_pool_lead(p_lead UUID, p_client UUID)
RETURNS INTEGER LANGUAGE sql AS $$
  UPDATE public.leads
  SET reserved_by = p_client, reserved_until = now() + INTERVAL '2 minutes'
  WHERE id = p_lead AND client_id IS NULL AND is_locked
    AND (reserved_until IS NULL OR reserved_until < now() OR reserved_by = p_client)
  RETURNING public.pool_price(acquisition_cost, created_at)
$$;

-- Asigna el lead apartado al cliente. FALSE = la reserva se perdió.
CREATE OR REPLACE FUNCTION public.claim_pool_lead(p_lead UUID, p_client UUID)
RETURNS BOOLEAN LANGUAGE sql AS $$
  WITH u AS (
    UPDATE public.leads
    SET client_id = p_client, is_locked = FALSE, claimed_at = now(),
        reserved_by = NULL, reserved_until = NULL
    WHERE id = p_lead AND client_id IS NULL AND reserved_by = p_client
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM u)
$$;

-- Descuenta crédito solo si alcanza. NULL = saldo insuficiente.
CREATE OR REPLACE FUNCTION public.deduct_balance(p_client UUID, p_amount NUMERIC)
RETURNS NUMERIC LANGUAGE sql AS $$
  UPDATE public.clients SET balance = balance - p_amount
  WHERE id = p_client AND balance >= p_amount
  RETURNING balance
$$;

REVOKE EXECUTE ON FUNCTION public.reserve_pool_lead(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_pool_lead(UUID, UUID)   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.deduct_balance(UUID, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.reserve_pool_lead(UUID, UUID) TO service_role;
GRANT  EXECUTE ON FUNCTION public.claim_pool_lead(UUID, UUID)   TO service_role;
GRANT  EXECUTE ON FUNCTION public.deduct_balance(UUID, NUMERIC) TO service_role;

-- ── 7. Seguridad: el cliente no puede tocar su saldo ni su status ─
CREATE OR REPLACE FUNCTION public.protect_client_columns()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF auth.role() = 'authenticated' AND NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.balance := 0;
      NEW.lead_price := 12;
      NEW.status := 'pending';
    ELSE
      NEW.balance              := OLD.balance;
      NEW.lead_price           := OLD.lead_price;
      NEW.status               := OLD.status;
      NEW.user_id              := OLD.user_id;
      NEW.stripe_customer_id   := OLD.stripe_customer_id;
      NEW.payment_method_last4 := OLD.payment_method_last4;
      NEW.payment_method_brand := OLD.payment_method_brand;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS protect_client_columns ON public.clients;
CREATE TRIGGER protect_client_columns
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.protect_client_columns();
