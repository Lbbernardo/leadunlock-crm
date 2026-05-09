import { CheckCircle2, Circle, AlertCircle, ArrowRight, ExternalLink, Clock, Zap } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'

const DONE = 'done'
const NEXT = 'next'
const PENDING = 'pending'

const SECTIONS = [
  {
    title: '✅ Construido y funcionando',
    color: 'border-green-500/30 bg-green-500/5',
    titleColor: 'text-green-400',
    items: [
      { label: 'Landing page completa (hero, precios, cómo funciona)' },
      { label: 'Auth: Login, Registro, Recuperar contraseña' },
      { label: 'Dashboard cliente con leads bloqueados/desbloqueados' },
      { label: 'Blur real en teléfono y email de leads bloqueados' },
      { label: 'Lead Detail: notas internas + cambio de estado' },
      { label: 'Billing: historial de pagos y balance' },
      { label: 'Integraciones: guías Meta Ads, Zapier, n8n, GHL, Make' },
      { label: 'Roadmap visual interactivo con checklists (5 fases)' },
      { label: 'Admin Cuentas: gestión de clientes y leads' },
      { label: 'Admin Finanzas: ingresos vs costo Meta, margen, crédito $100' },
      { label: 'Onboarding cliente: wizard 4 pasos + pago $100' },
      { label: 'Webhook para recibir leads de Meta/GHL/Zapier/n8n' },
      { label: 'Integración Stripe: pago $20 por lead + $100 activación' },
      { label: 'Schema Supabase con RLS multi-tenant completo' },
      { label: 'Mock data con 10 leads y 3 clientes de prueba' },
      { label: 'Modo demo: funciona sin Supabase ni Stripe configurados' },
      { label: 'Git inicializado con primer commit' },
      { label: 'Build de producción pasa sin errores' },
    ],
  },
  {
    title: '🚀 Próximo — Deploy a producción',
    color: 'border-blue-500/30 bg-blue-500/5',
    titleColor: 'text-blue-400',
    steps: [
      {
        number: '1',
        title: 'GitHub',
        time: '2 min',
        status: NEXT,
        detail: 'Crear repo "leadunlock-crm" y hacer git push origin main',
        url: 'https://github.com/new',
        urgent: true,
      },
      {
        number: '2',
        title: 'Supabase',
        time: '15 min',
        status: PENDING,
        detail: 'Crear proyecto, correr supabase/schema.sql, copiar las 3 keys',
        url: 'https://supabase.com',
      },
      {
        number: '3',
        title: 'Stripe',
        time: '10 min',
        status: PENDING,
        detail: 'Activar cuenta real, copiar publishable key y secret key',
        url: 'https://stripe.com',
      },
      {
        number: '4',
        title: 'Vercel',
        time: '5 min',
        status: PENDING,
        detail: 'Importar repo de GitHub, agregar 7 variables de entorno, Deploy',
        url: 'https://vercel.com',
      },
      {
        number: '5',
        title: 'Webhook Stripe',
        time: '3 min',
        status: PENDING,
        detail: 'Agregar endpoint /api/stripe/webhook con evento payment_intent.succeeded',
        url: 'https://dashboard.stripe.com/webhooks',
      },
      {
        number: '6',
        title: 'Usuario admin en DB',
        time: '2 min',
        status: PENDING,
        detail: 'UPDATE public.users SET role = \'admin\' WHERE email = \'tu@email.com\'',
      },
    ],
  },
  {
    title: '🔧 Después del deploy — mejoras prioritarias',
    color: 'border-slate-700 bg-slate-900/50',
    titleColor: 'text-slate-400',
    pending: [
      { label: 'Conectar n8n en Railway para automatizar flujo de leads', priority: 'Alta' },
      { label: 'Notificación WhatsApp al cliente cuando llega lead nuevo', priority: 'Alta' },
      { label: 'Activar Supabase Realtime (leads aparecen sin recargar)', priority: 'Media' },
      { label: 'Sidebar responsive para mobile', priority: 'Media' },
      { label: 'Verificación de challenge de Meta Ads en el webhook', priority: 'Media' },
      { label: 'Lógica automática del crédito $100 en Supabase', priority: 'Media' },
      { label: 'Paginación de leads (con 50+ leads)', priority: 'Baja' },
      { label: 'Exportar leads a CSV', priority: 'Baja' },
    ],
  },
]

const priorityColor = {
  Alta: 'text-red-400 bg-red-500/10',
  Media: 'text-yellow-400 bg-yellow-500/10',
  Baja: 'text-slate-400 bg-slate-700',
}

export default function Estado() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-xs font-bold text-green-400 uppercase tracking-widest">LeadUnlock CRM</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">¿Dónde me quedé?</h1>
            <p className="text-slate-400 mt-1">Estado completo del proyecto al <strong className="text-white">7 de mayo, 2026</strong></p>
          </div>

          {/* Banner próximo paso */}
          <div className="bg-blue-500/10 border-2 border-blue-500/40 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <ArrowRight size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-0.5">Próximo paso inmediato</p>
              <p className="text-white font-bold text-lg">Subir el código a GitHub</p>
              <p className="text-slate-400 text-sm">Crear repo "leadunlock-crm" → git push. Tarda 2 minutos.</p>
            </div>
            <a
              href="https://github.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
            >
              Ir a GitHub <ExternalLink size={14} />
            </a>
          </div>

          <div className="space-y-6">

            {/* SECCIÓN 1 — Lo que está hecho */}
            <div className={`rounded-2xl border p-6 ${SECTIONS[0].color}`}>
              <h2 className={`font-bold text-lg mb-4 ${SECTIONS[0].titleColor}`}>{SECTIONS[0].title}</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {SECTIONS[0].items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN 2 — Deploy */}
            <div className={`rounded-2xl border p-6 ${SECTIONS[1].color}`}>
              <h2 className={`font-bold text-lg mb-5 ${SECTIONS[1].titleColor}`}>{SECTIONS[1].title}</h2>
              <div className="space-y-3">
                {SECTIONS[1].steps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      step.urgent
                        ? 'bg-blue-500/10 border-blue-500/40'
                        : 'bg-slate-900/50 border-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                      step.urgent ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {step.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-semibold ${step.urgent ? 'text-white' : 'text-slate-300'}`}>
                          {step.title}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={11} /> {step.time}
                        </span>
                        {step.urgent && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold">
                            SIGUIENTE
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{step.detail}</p>
                    </div>
                    {step.url && (
                      <a
                        href={step.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-blue-400 transition-colors flex-shrink-0 mt-1"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN 3 — Pendiente post-deploy */}
            <div className={`rounded-2xl border p-6 ${SECTIONS[2].color}`}>
              <h2 className={`font-bold text-lg mb-4 ${SECTIONS[2].titleColor}`}>{SECTIONS[2].title}</h2>
              <div className="space-y-2">
                {SECTIONS[2].pending.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Circle size={14} className="text-slate-700 flex-shrink-0" />
                    <span className="text-slate-400 text-sm flex-1">{item.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[item.priority]}`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nota final */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
              <p className="text-slate-400 text-sm">
                El MVP está <strong className="text-green-400">100% construido</strong> y funciona localmente.<br />
                Solo falta conectar los servicios externos y hacer el deploy.<br />
                <strong className="text-white">Tiempo estimado para estar en producción: ~35 minutos.</strong>
              </p>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
