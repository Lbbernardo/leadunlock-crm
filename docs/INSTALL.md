# LeadUnlock CRM — Guía de Instalación

## Requisitos previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Stripe](https://stripe.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)

---

## 1. Clonar / abrir el proyecto

```bash
cd lead_system
npm install
```

---

## 2. Configurar Supabase

### 2.1 Crear proyecto
1. Ve a [supabase.com](https://supabase.com) → "New project"
2. Guarda la **URL** y la **anon key** (Settings > API)

### 2.2 Ejecutar el schema
1. Supabase Dashboard → **SQL Editor** → "New query"
2. Pega el contenido de `supabase/schema.sql`
3. Click **Run**

### 2.3 Cargar datos mock (opcional, solo dev)
1. Abre `supabase/seed.sql`
2. En el Dashboard ve a **Authentication > Users** y crea los 4 usuarios con estos emails:
   - `admin@leadunlock.com` (contraseña: cualquiera)
   - `admin@hipotecafacil.com`
   - `ventas@segurosg.com`
   - `info@pymecapital.mx`
3. Copia sus UUIDs y reemplázalos en `seed.sql` donde dice `aaaaaaaa-...` y `bbbbbbbb-...`
4. Ejecuta `seed.sql` en el SQL Editor

### 2.4 Obtener el Service Role Key
Settings > API > **service_role** (mantenerla privada, nunca al frontend)

---

## 3. Configurar Stripe

### 3.1 Modo test
1. Ve a [stripe.com](https://stripe.com) → Dashboard
2. Activa **Test mode** (toggle arriba a la derecha)
3. Developers > API keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### 3.2 Webhook local (desarrollo)
```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Autenticarse
stripe login

# Reenviar eventos al servidor local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copia el **webhook signing secret** que aparece (`whsec_...`)

---

## 4. Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Rellena cada valor:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_URL=https://xxxx.supabase.co

# Token aleatorio para autenticar el webhook de leads
WEBHOOK_SECRET=genera-un-token-de-32-caracteres-aqui
```

---

## 5. Ejecutar en local

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

Para probar las API routes de Stripe en local, usa Vercel CLI:
```bash
npm install -g vercel
vercel dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 6. Probar pagos con Stripe (modo test)

Usa estas tarjetas de prueba:

| Número           | Resultado  |
|-----------------|------------|
| 4242 4242 4242 4242 | Pago exitoso |
| 4000 0000 0000 9995 | Pago rechazado |
| 4000 0025 0000 3155 | Requiere autenticación 3D |

- Fecha de expiración: cualquier fecha futura (ej. `12/34`)
- CVC: cualquier 3 dígitos

---

## 7. Probar el webhook de leads

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-token: TU_WEBHOOK_SECRET" \
  -d '{
    "full_name": "Test Lead",
    "phone": "+52 55 0000 0000",
    "email": "test@ejemplo.com",
    "city": "CDMX",
    "state": "Ciudad de México",
    "campaign_name": "Campaña Test",
    "product_interest": "Crédito hipotecario",
    "source": "Manual",
    "client_id": "UUID_DEL_CLIENTE"
  }'
```

---

## 8. Deploy en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configurar variables de entorno en Vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_URL
vercel env add WEBHOOK_SECRET

# Deploy producción
vercel --prod
```

### 8.1 Configurar webhook de Stripe en producción
1. Stripe Dashboard > Developers > Webhooks > **Add endpoint**
2. URL: `https://tu-dominio.vercel.app/api/stripe/webhook`
3. Events: `payment_intent.succeeded`
4. Copia el **Signing secret** y actualiza `STRIPE_WEBHOOK_SECRET` en Vercel

---

## 9. Crear usuario admin

1. Ve a Supabase Dashboard > Authentication > Users
2. Crea un usuario con email `admin@tudominio.com`
3. En SQL Editor, actualiza su rol:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'admin@tudominio.com';
```

---

## 10. Integración con Meta Ads

### Con Zapier
1. Trigger: **Facebook Lead Ads > New Lead**
2. Action: **Webhooks by Zapier > POST**
   - URL: `https://tu-dominio.vercel.app/api/webhook`
   - Headers: `x-webhook-token: TU_WEBHOOK_SECRET`
   - Body: mapea los campos del formulario de Meta

### Con n8n
1. Trigger: **Facebook Lead Ads**
2. Node HTTP: POST a `/api/webhook` con el mismo formato

### Con Make (Integromat)
Similar a Zapier: módulo **Watch New Leads** → **HTTP > Make a request**

---

## Estructura del proyecto

```
lead_system/
├── src/
│   ├── components/         # UI y layout
│   ├── pages/              # Landing, Auth, Dashboard, Admin
│   ├── context/            # AuthContext (Supabase)
│   └── lib/                # Cliente Supabase
├── api/
│   ├── webhook.js          # Recibir leads externos
│   └── stripe/
│       ├── create-payment-intent.js
│       ├── confirm-unlock.js
│       └── webhook.js
├── supabase/
│   ├── schema.sql          # Tablas + RLS + funciones
│   └── seed.sql            # Datos mock
├── tracker/
│   └── ProjectTracker.jsx  # Tracker visual del proyecto
└── docs/
    └── INSTALL.md          # Este archivo
```
