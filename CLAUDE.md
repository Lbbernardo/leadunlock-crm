# LeadUnlock CRM — Asistente Autónomo

## 🧠 Cómo operar en cada sesión

Al iniciar una conversación con Luis:
1. Lee este archivo completo
2. Lee los archivos de memoria en `/home/luisbernardo/.claude/projects/-home-luisbernardo-Desktop-lead-system/memory/`
3. Revisa `git log --oneline -10` para saber qué se hizo último
4. Propón el siguiente paso del roadmap **sin que Luis lo pida**
5. Siempre responde en español
6. No ejecutes comandos destructivos sin confirmación
7. Siempre haz commit + push + deploy después de cada feature

---

## 👤 El usuario

**Luis Baez** — fundador de LeadUnlock CRM. Trabaja de noche. Prefiere respuestas cortas y directas. No es desarrollador de carrera — revisa el output visualmente en el navegador. Cuando dice "ya" significa que completó el paso que le pediste.

---

## 📊 El negocio

**LeadUnlock CRM** es una agencia de leads con entrega SaaS para agentes de seguros y servicios financieros en EE.UU.

### Modelo de ingresos
| Concepto | Monto |
|----------|-------|
| Activación de cuenta | $100 (cobrado con Stripe al registrarse) |
| Por lead desbloqueado | Variable, mínimo $12 |
| Crédito de fidelidad | Al llegar a $1,000 en leads o 50 desbloqueados, se devuelven $100 al cliente |

### Flujo del cliente
1. Se registra → paga $100 de activación (Stripe)
2. Ve pantalla "Building" mientras Luis configura su campaña en Meta Ads
3. Luis crea la campaña en admin y pega el `meta_form_id`
4. Los leads empiezan a llegar → cliente los ve bloqueados
5. Cliente paga por lead (con crédito o tarjeta guardada) → se desbloquea
6. Si el cliente llega a $1,000 en leads comprados → recibe $100 de crédito de vuelta

### Nichos actuales
- Gastos finales (Final Expense)
- Productos financieros (UIL, Anualidades, Whole Life)
- Seguros de vida
- Medicare / Medicaid
- Seguros de auto
- Bienes raíces

---

## 🏗️ Arquitectura técnica

### Stack
| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Vercel Serverless Functions (Node.js) |
| Base de datos | Supabase (PostgreSQL + Auth + RLS) |
| Pagos | Stripe (PaymentIntents + saved cards) |
| Leads Meta Ads | Make.com → `/api/make-lead` → Facebook Graph API |
| Leads otros | `/api/webhook` con header `x-webhook-token` |
| Notificaciones | Resend (email admin) + Twilio SMS (pendiente verificación toll-free) |
| Deploy | Vercel (auto-deploy desde GitHub main) |
| Dominio | unlocklead.click |

### Variables de entorno necesarias en Vercel
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
VITE_STRIPE_PUBLISHABLE_KEY
META_PAGE_ACCESS_TOKEN      # Token permanente de Meta (expira si no es long-lived)
WEBHOOK_SECRET              # Para /api/webhook externo
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER         # +18886439527 (toll-free, pendiente verificación)
ADMIN_PHONE                 # +16304154252 (número de Luis)
ADMIN_EMAIL                 # lbbernardoo@gmail.com (cuenta Resend)
RESEND_API_KEY              # API key de Resend
```

---

## 📁 Mapa completo de archivos

### API (Vercel Serverless — máximo 12 en Hobby)
```
api/
  make-lead.js              # Recibe lead de Make.com → Facebook Graph API → Supabase → SMS + Email
  webhook.js                # Recibe leads de Zapier/n8n/Make genérico
  unlock-lead.js            # Descuenta crédito y desbloquea lead
  admin/
    add-credit.js           # Admin agrega crédito a cliente
  stripe/
    create-activation-payment.js  # Crea PaymentIntent de $100
    confirm-activation.js         # Confirma pago, guarda tarjeta, activa cuenta
    create-setup-intent.js        # Para agregar tarjeta sin cobro
    confirm-setup.js              # Confirma guardado de tarjeta
    charge-lead.js                # Cobra lead con tarjeta guardada (sin crédito)
    webhook.js                    # Webhooks de Stripe
```
**Total: 9 funciones** (límite Hobby: 12)

### Frontend — Páginas
```
src/pages/
  Landing.jsx               # Página pública de ventas
  Privacy.jsx               # Política de privacidad
  auth/
    Login.jsx
    Register.jsx
    ForgotPassword.jsx
    ResetPassword.jsx
  onboarding/
    Onboarding.jsx          # 4 pasos: info → datos campaña → pago $100 → confirmación
  dashboard/
    ClientDashboard.jsx     # Grid de leads con filtros
    LeadDetail.jsx          # Detalle del lead + notas + status
    Billing.jsx             # Historial de pagos y crédito
    Help.jsx                # FAQs y contacto
    Profile.jsx             # Perfil + tarjeta guardada
    Building.jsx            # Pantalla de espera (polling cada 15s hasta meta_form_id)
  admin/
    AdminDashboard.jsx      # Tabs: Resumen | Clientes | Leads | Campañas | Categorías | Descuentos
    AdminFinanzas.jsx       # Métricas financieras reales de Supabase
    Manual.jsx              # Manual de uso para el admin
```

### Frontend — Componentes clave
```
src/components/
  layout/DashboardLayout.jsx     # Sidebar + header compartido
  billing/PaymentModal.jsx       # Modal de desbloqueo (crédito o tarjeta)
  leads/LeadCard.jsx             # Card de lead en el dashboard
  leads/LeadFilters.jsx          # Filtros de búsqueda
  ui/Badge.jsx                   # StatusBadge, Badge
  ui/Button.jsx
  ui/Modal.jsx
src/context/AuthContext.jsx      # Estado global: user, profile, clientData, isMock
src/lib/supabase.js              # Cliente de Supabase
```

---

## 🔄 Flujos principales

### Cómo llega un lead de Meta Ads
1. Lead llena formulario en Meta Ads
2. Meta notifica a Make.com (webhook configurado con el form_id)
3. Make.com llama `POST /api/make-lead` con `{lead_id, form_id}`
4. `make-lead.js` llama Facebook Graph API para obtener datos del lead
5. Busca en `campaigns` por `meta_form_id` → encuentra `client_id`
6. Inserta en `leads` con `is_locked: true`
7. Envía SMS al cliente (Twilio) + Email al admin (Resend)

### Cómo desbloquea un lead el cliente
**Con crédito:** `POST /api/unlock-lead` → descuenta balance → `is_locked: false`
**Con tarjeta:** `POST /api/stripe/charge-lead` → cobra Stripe → `is_locked: false`

### Cómo se activa una cuenta nueva
1. Cliente completa onboarding (4 pasos)
2. Paga $100 → `POST /api/stripe/create-activation-payment` → PaymentIntent
3. Pago exitoso → `POST /api/stripe/confirm-activation` → guarda tarjeta + activa cuenta
4. Cliente ve pantalla Building (polling cada 15s)
5. Luis crea campaña en admin con `meta_form_id` → cliente entra al dashboard

---

## 🗄️ Base de datos (Supabase)

### Tablas principales
```
users            id, email, full_name, role (admin | client)
clients          id, user_id, company_name, phone, city, status (pending|active|paused),
                 balance, lead_price, stripe_customer_id, payment_method_last4,
                 payment_method_brand, activation_amount_paid, product_description,
                 target_state, categories, budget, leads_per_month, target_audience, goal
campaigns        id, client_id, name, source, meta_form_id, is_active, interest_category
leads            id, client_id, campaign_id, campaign_name, full_name, phone, email,
                 city, state, product_interest, source, is_locked, status, notes,
                 acquisition_cost, created_at
lead_unlocks     id, client_id, lead_id, amount_paid, created_at
discount_codes   id, code, discount_pct, max_uses, used_count, expires_at, active
```

### RPC disponible
```sql
get_client_leads(p_client_id UUID) -- Retorna leads del cliente con is_unlocked calculado
```

---

## 📈 Estado actual del negocio

- **Plataforma:** 100% funcional en producción (unlocklead.click)
- **Clientes activos:** En crecimiento (ver AdminFinanzas para número real)
- **Leads:** Entrando via Make.com + Meta Ads
- **Notificaciones:** Email a admin funciona (Resend) / SMS pendiente verificación toll-free (#888-643-9527)
- **Pagos:** Stripe funcionando (activación + tarjeta guardada + cobro por lead)

---

## 🚀 Roadmap de escalado (en orden de prioridad)

### Fase 1 — Estabilizar (inmediato)
- [ ] Verificar número toll-free en Twilio (Messaging → Regulatory Compliance → Toll-Free Verification)
- [ ] Registrar el Meta Page Access Token como long-lived (expira cada 60 días — automatizar renovación)
- [ ] Arreglar error 400 en Stripe webhook (`/api/stripe/webhook`)
- [ ] Probar flujo completo de desbloqueo con tarjeta guardada (`charge-lead.js`)

### Fase 2 — Escalar clientes (1-4 semanas)
- [ ] Sistema de referidos: código único por cliente que da descuento en activación
- [ ] Email de bienvenida automático cuando se activa una cuenta
- [ ] Notificación automática al cliente cuando llega un lead (ya tiene SMS pendiente)
- [ ] Panel de métricas del cliente más detallado (tasa de contacto, leads cerrados)

### Fase 3 — Automatización (1-3 meses)
- [ ] Auto-renovación del Meta Page Access Token vía cron
- [ ] Integración directa con Meta Webhooks (sin Make.com) para ahorrar costo
- [ ] CRM ligero: seguimiento de leads por etapa (nuevo → contactado → propuesta → cerrado)
- [ ] Reportes automáticos semanales por email al cliente (leads de la semana, tasa conversión)

### Fase 4 — App móvil (3-6 meses)
- [ ] App iOS/Android con Capacitor (mismo código React)
- [ ] Push notifications en lugar de SMS
- [ ] Modo offline para ver leads ya desbloqueados

### Fase 5 — Asistente online (6+ meses)
- [ ] Chatbot en dashboard con contexto del negocio de Luis
- [ ] Integración con Claude API
- [ ] Acceso desde móvil sin abrir la laptop

---

## ⚙️ Comportamiento autónomo del asistente

### Al iniciar sesión, siempre hacer:
1. `git log --oneline -5` para saber qué se hizo último
2. Revisar si hay tareas pendientes del roadmap Fase 1
3. Proponer el siguiente paso más urgente

### Patrones de decisión
- Si hay un bug en producción → solucionarlo antes de cualquier feature
- Si hay una tarea de Fase 1 pendiente → completarla antes de Fase 2
- Si Luis pide algo que no está en el roadmap → implementarlo y agregarlo al historial
- Si algo requiere SQL en Supabase → siempre proporcionar el SQL listo para copiar/pegar
- Si el cambio toca la lógica de pagos → siempre hacer commit separado y verificar en producción

### Comandos de deploy estándar
```bash
git add <archivos>
git commit -m "feat/fix/chore: descripción"
git push origin main
npx vercel --prod --yes
```

### Cómo interpretar respuestas cortas de Luis
- "ya" → completó el paso, continuar
- "si" → confirmación, proceder
- "no funciona" / "no llego" → hay un bug, revisar logs de Vercel
- "dime que entiendes" → quiere validar antes de que implemente
- "haz un deploy" → ejecutar el deploy estándar

---

## 🔐 Seguridad y restricciones

- Este asistente es **exclusivo de Luis Baez** — Claude Code solo corre localmente
- Nunca publicar `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` ni tokens en el código
- El patrón `IS_MOCK` solo activo en `import.meta.env.DEV` — nunca en producción
- Siempre verificar que `adminOnly` esté en rutas de admin
- Los webhooks externos requieren `x-webhook-token` header

---

## 📞 Contactos y servicios

| Servicio | Uso | Notas |
|----------|-----|-------|
| Supabase | DB + Auth | Proyecto: efpghompqqohyllavmtm |
| Stripe | Pagos | Cuenta de Luis |
| Twilio | SMS | Credenciales en Vercel env vars |
| Resend | Email | Cuenta: lbbernardoo@gmail.com |
| Make.com | Automatización Meta leads | Conectado a Meta Form |
| Vercel | Deploy | Proyecto: leadunlock-crm |
| GitHub | Repositorio | Lbbernardo/leadunlock-crm |
