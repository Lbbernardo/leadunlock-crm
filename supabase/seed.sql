-- ============================================================
-- LeadUnlock CRM — Mock Data (Development Only)
-- Run AFTER schema.sql
-- ⚠️  Do NOT run in production
-- ============================================================

-- NOTE: users are created via Supabase Auth — insert them manually
-- via the Supabase Dashboard > Authentication > Users, then use
-- their UUIDs below. These are placeholder UUIDs.

DO $$
DECLARE
  admin_user_id  UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  client1_uid    UUID := 'bbbbbbbb-0000-0000-0000-000000000001';
  client2_uid    UUID := 'bbbbbbbb-0000-0000-0000-000000000002';
  client3_uid    UUID := 'bbbbbbbb-0000-0000-0000-000000000003';
  client1_id     UUID;
  client2_id     UUID;
  client3_id     UUID;
  camp1_id       UUID;
  camp2_id       UUID;
  lead1_id       UUID;
  lead4_id       UUID;
  lead7_id       UUID;
BEGIN

  -- Users
  INSERT INTO public.users (id, email, full_name, role) VALUES
    (admin_user_id,  'admin@leadunlock.com',      'Admin Sistema',      'admin'),
    (client1_uid,    'admin@hipotecafacil.com',   'Juan García',        'client'),
    (client2_uid,    'ventas@segurosg.com',       'María Rodríguez',    'client'),
    (client3_uid,    'info@pymecapital.mx',       'Roberto Castillo',   'client')
  ON CONFLICT (id) DO NOTHING;

  -- Clients
  INSERT INTO public.clients (user_id, company_name, lead_price, balance) VALUES
    (client1_uid, 'Hipoteca Fácil MX', 20.00, 0),
    (client2_uid, 'Seguros García',    20.00, 0),
    (client3_uid, 'PyME Capital',      20.00, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT id INTO client1_id FROM public.clients WHERE user_id = client1_uid;
  SELECT id INTO client2_id FROM public.clients WHERE user_id = client2_uid;
  SELECT id INTO client3_id FROM public.clients WHERE user_id = client3_uid;

  -- Campaigns
  INSERT INTO public.campaigns (id, client_id, name, source, is_active) VALUES
    (uuid_generate_v4(), client1_id, 'Camp_Hipoteca_Q1',      'Meta Ads',    TRUE),
    (uuid_generate_v4(), client2_id, 'Camp_Seguros_Jalisco',  'Meta Ads',    TRUE),
    (uuid_generate_v4(), client3_id, 'Camp_PyME_CDMX',        'Meta Ads',    TRUE),
    (uuid_generate_v4(), client3_id, 'Retargeting_NL',        'n8n',         TRUE);

  -- Leads for client 1 (Hipoteca Fácil)
  lead1_id := uuid_generate_v4();
  lead4_id := uuid_generate_v4();
  lead7_id := uuid_generate_v4();

  INSERT INTO public.leads
    (id, client_id, full_name, phone, email, city, state, product_interest, source, campaign_name, is_locked, status, notes)
  VALUES
    (lead1_id,           client1_id, 'Carlos Mendoza',      '+52 55 1234 5678', 'carlos@ejemplo.com',    'CDMX',         'Ciudad de México', 'Crédito hipotecario', 'Meta Ads',    'Camp_Hipoteca_Q1',     FALSE, 'interested', 'Muy interesado, llamar en la tarde.'),
    (uuid_generate_v4(), client1_id, 'Patricia Herrera',    '+52 222 444 5555', 'pati.h@ejemplo.com',    'Puebla',       'Puebla',           'Crédito hipotecario', 'Meta Ads',    'Camp_Hipoteca_Q1',     TRUE,  'new',        NULL),
    (uuid_generate_v4(), client1_id, 'Miguel Ángel Reyes',  '+52 55 9999 0000', 'miguel.r@ejemplo.com',  'Naucalpan',    'Estado de México',  'Crédito hipotecario', 'Meta Ads',    'Camp_Hipoteca_Q1',     TRUE,  'new',        NULL),

  -- Leads for client 2 (Seguros García)
    (uuid_generate_v4(), client2_id, 'María López García',  '+52 33 9876 5432', 'maria.lg@ejemplo.com',  'Guadalajara',  'Jalisco',          'Seguro de auto',      'Meta Ads',    'Camp_Seguros_Jalisco',  TRUE,  'new',        NULL),
    (uuid_generate_v4(), client2_id, 'Sofía Castillo Luna', '+52 33 3333 4444', 'sofia.cl@ejemplo.com',  'Guadalajara',  'Jalisco',          'Seguro de vida',      'GoHighLevel', 'Camp_Seguros_Jalisco',  TRUE,  'new',        NULL),

  -- Leads for client 3 (PyME Capital)
    (lead4_id,           client3_id, 'Ana Flores Ramos',    '+52 55 2222 3333', 'ana.fr@ejemplo.com',    'CDMX',         'Ciudad de México', 'Crédito PyME',        'Meta Ads',    'Camp_PyME_CDMX',       FALSE, 'contacted',  'Demo agendada para el viernes.'),
    (uuid_generate_v4(), client3_id, 'Roberto Sánchez',     '+52 81 5555 6666', 'roberto.s@ejemplo.com', 'Monterrey',    'Nuevo León',       'Consultoría fiscal',  'Zapier',      'Retargeting_NL',        TRUE,  'new',        NULL),
    (uuid_generate_v4(), client3_id, 'Luis Torres Vega',    '+52 664 111 2222', 'luis.tv@ejemplo.com',   'Tijuana',      'Baja California',  'Importación',         'n8n',         'Retargeting_NL',        TRUE,  'new',        NULL),
    (lead7_id,           client3_id, 'Jorge Ramírez Díaz',  '+52 55 7777 8888', 'jorge.rd@ejemplo.com',  'Toluca',       'Estado de México', 'Seguro de vida',      'Meta Ads',    'Camp_PyME_CDMX',       FALSE, 'closed',     'Firmó contrato el 2024-03-01.'),
    (uuid_generate_v4(), client3_id, 'Isabel Vargas Cruz',  '+52 477 222 3333', 'isabel.v@ejemplo.com',  'León',         'Guanajuato',       'Crédito PyME',        'Meta Ads',    'Camp_PyME_CDMX',       TRUE,  'new',        NULL);

  -- Lead unlocks (for leads already marked is_locked=FALSE)
  INSERT INTO public.lead_unlocks (lead_id, client_id, amount_paid, stripe_payment_intent_id) VALUES
    (lead1_id, client1_id, 20.00, 'pi_test_mock_001'),
    (lead4_id, client3_id, 20.00, 'pi_test_mock_002'),
    (lead7_id, client3_id, 20.00, 'pi_test_mock_003');

  -- Payments
  INSERT INTO public.payments (client_id, stripe_payment_intent_id, amount, status, description) VALUES
    (client1_id, 'pi_test_mock_001', 20.00, 'succeeded', 'Desbloqueo: Carlos Mendoza'),
    (client3_id, 'pi_test_mock_002', 20.00, 'succeeded', 'Desbloqueo: Ana Flores Ramos'),
    (client3_id, 'pi_test_mock_003', 20.00, 'succeeded', 'Desbloqueo: Jorge Ramírez Díaz');

END $$;
