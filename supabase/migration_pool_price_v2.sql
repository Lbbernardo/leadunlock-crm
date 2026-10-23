-- Precio del pool v2 (oct 2026): 2× el costo al llegar → 3× a los 30 min → 1× (costo) a las 6 horas.
-- Sin mínimo de $12 (mínimo $1 para que nunca sea gratis).
CREATE OR REPLACE FUNCTION public.pool_price(p_cost NUMERIC, p_created TIMESTAMPTZ)
RETURNS INTEGER LANGUAGE sql STABLE AS $$
  SELECT GREATEST(1, ROUND(
    COALESCE(p_cost, 0) *
    CASE WHEN now() - p_created < INTERVAL '30 minutes' THEN 2
         WHEN now() - p_created < INTERVAL '6 hours'    THEN 3
         ELSE 1 END
  ))::INTEGER
$$;
