-- Clientes solo pueden editar notes y status de sus leads.
-- Admin y service_role (APIs) no se ven afectados.
CREATE OR REPLACE FUNCTION public.protect_lead_columns()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF auth.role() = 'authenticated' AND NOT public.is_admin() THEN
    IF NEW.is_locked        IS DISTINCT FROM OLD.is_locked
    OR NEW.client_id        IS DISTINCT FROM OLD.client_id
    OR NEW.acquisition_cost IS DISTINCT FROM OLD.acquisition_cost
    OR NEW.full_name        IS DISTINCT FROM OLD.full_name
    OR NEW.phone            IS DISTINCT FROM OLD.phone
    OR NEW.email            IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Solo puedes editar notas y estado del lead';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS protect_lead_columns ON public.leads;
CREATE TRIGGER protect_lead_columns
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.protect_lead_columns();
