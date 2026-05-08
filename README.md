# LeadUnlock CRM

**Recibe leads de Meta Ads sin pagar instalación costosa de CRM.**

Plataforma SaaS donde negocios reciben leads parcialmente bloqueados y pagan $20 por desbloquear teléfono y email completos.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend / DB:** Supabase (PostgreSQL + Auth + RLS)
- **Pagos:** Stripe (modo test incluido)
- **Deploy:** Vercel (frontend + API routes)

## Inicio rápido

```bash
npm install
cp .env.example .env.local
# Rellena las variables (ver docs/INSTALL.md)
npm run dev
```

## Documentación completa

Ver [`docs/INSTALL.md`](docs/INSTALL.md)

## Estado del MVP

| Módulo | Estado |
|--------|--------|
| Landing page | ✅ |
| Auth (login/registro/recuperar) | ✅ |
| Dashboard cliente | ✅ |
| Leads bloqueados/desbloqueados | ✅ |
| Lead detail + notas | ✅ |
| Billing + historial de pagos | ✅ |
| Admin panel | ✅ |
| Webhook de leads | ✅ |
| Integración Stripe | ✅ |
| Schema Supabase + RLS | ✅ |
| Mock data | ✅ |
