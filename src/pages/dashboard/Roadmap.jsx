import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Check, ChevronDown, ChevronUp, Clock, DollarSign, Zap, ExternalLink, Circle, CheckCircle2, Lock } from 'lucide-react'
import clsx from 'clsx'

const STORAGE_KEY = 'leadunlock_roadmap'

const PHASES = [
  {
    id: 'base',
    number: '01',
    name: 'Base Técnica',
    subtitle: 'Infraestructura lista para producción',
    color: '#3B82F6',
    bg: 'from-blue-500/10 to-blue-500/5',
    border: 'border-blue-500/30',
    icon: '🏗️',
    totalTime: '35 min',
    totalCost: '$0',
    steps: [
      {
        id: 'supabase',
        title: 'Configurar Supabase',
        time: '15 min',
        cost: 'Gratis',
        difficulty: 'Fácil',
        description: 'Base de datos + auth + Row Level Security para multi-tenant.',
        tools: [{ name: 'Supabase', url: 'https://supabase.com' }],
        checklist: [
          'Crear cuenta en supabase.com',
          'Crear nuevo proyecto (elige región más cercana)',
          'Ir a SQL Editor → pegar supabase/schema.sql → Run',
          'Copiar Project URL y anon key',
          'Pegar en .env.local: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY',
          'Copiar service_role key → SUPABASE_SERVICE_ROLE_KEY',
          'Probar: npm run dev → crear cuenta en /register',
        ],
        tip: 'El plan gratuito de Supabase aguanta hasta 50,000 filas y 500MB. Suficiente para los primeros 500 clientes.',
      },
      {
        id: 'stripe',
        title: 'Activar Stripe en modo live',
        time: '10 min',
        cost: '2.9% + $0.30 por transacción',
        difficulty: 'Fácil',
        description: 'Pagos reales de $20 por lead desbloqueado.',
        tools: [{ name: 'Stripe Dashboard', url: 'https://dashboard.stripe.com' }],
        checklist: [
          'Crear cuenta en stripe.com y verificar negocio',
          'Desactivar "Test mode" en el toggle superior',
          'Developers → API Keys → copiar Publishable key y Secret key',
          'Pegar en .env.local: VITE_STRIPE_PUBLISHABLE_KEY y STRIPE_SECRET_KEY',
          'Crear webhook en Developers → Webhooks → Add endpoint',
          'URL: https://tu-dominio.vercel.app/api/stripe/webhook',
          'Evento: payment_intent.succeeded',
          'Copiar Signing secret → STRIPE_WEBHOOK_SECRET',
        ],
        tip: 'En modo test usa tarjeta 4242 4242 4242 4242 para probar sin cargos reales.',
      },
      {
        id: 'vercel',
        title: 'Deploy en Vercel',
        time: '10 min',
        cost: 'Gratis',
        difficulty: 'Fácil',
        description: 'Tu plataforma en vivo con dominio propio.',
        tools: [{ name: 'Vercel', url: 'https://vercel.com' }, { name: 'GitHub', url: 'https://github.com' }],
        checklist: [
          'Subir el proyecto a GitHub: git init → git add . → git commit → git push',
          'Entrar a vercel.com → New Project → importar repo de GitHub',
          'En "Environment Variables" agregar todas las variables de .env.local',
          'Click Deploy — Vercel detecta Vite automáticamente',
          'Copiar la URL del proyecto (ej: leadunlock.vercel.app)',
          'Actualizar la URL del webhook de Stripe con el dominio real',
          'Probar /register → crear cuenta → ver dashboard',
        ],
        tip: 'El plan gratuito de Vercel incluye dominio .vercel.app + SSL + deploys ilimitados.',
      },
    ],
  },
  {
    id: 'fuente',
    number: '02',
    name: 'Fuente de Leads',
    subtitle: 'Conecta Meta Ads y GoHighLevel',
    color: '#F97316',
    bg: 'from-orange-500/10 to-orange-500/5',
    border: 'border-orange-500/30',
    icon: '📡',
    totalTime: '40 min',
    totalCost: 'Ya pagado (Meta/GHL)',
    steps: [
      {
        id: 'meta',
        title: 'Formulario de leads en Meta Ads',
        time: '20 min',
        cost: 'Presupuesto de campaña',
        difficulty: 'Media',
        description: 'Crear un Lead Form en Facebook/Instagram que capture los datos que necesitas.',
        tools: [{ name: 'Meta Business Suite', url: 'https://business.facebook.com' }],
        checklist: [
          'Abrir Meta Ads Manager → Crear campaña → objetivo: Clientes potenciales',
          'En el conjunto de anuncios seleccionar "Formulario instantáneo"',
          'Crear formulario con campos: Nombre completo, Teléfono, Email, Ciudad',
          'Agregar pregunta personalizada: "¿Qué producto te interesa?"',
          'En configuración del formulario → activar webhook (ver paso n8n)',
          'Publicar la campaña con presupuesto mínimo ($5/día para pruebas)',
          'Verificar que los leads de prueba lleguen al webhook',
        ],
        tip: 'Los formularios instantáneos de Meta convierten 2-3x mejor que landing pages externas porque el usuario no abandona la app.',
      },
      {
        id: 'ghl',
        title: 'Conectar GoHighLevel',
        time: '15 min',
        cost: 'Incluido en GHL',
        difficulty: 'Fácil',
        description: 'GHL envía cada contacto nuevo a LeadUnlock automáticamente.',
        tools: [{ name: 'GoHighLevel', url: 'https://app.gohighlevel.com' }],
        checklist: [
          'En GHL ir a Settings → Integrations → Webhooks',
          'Click "Add New Webhook"',
          'URL: https://tu-dominio.vercel.app/api/webhook',
          'Eventos: Contact Created, Contact Updated',
          'Agregar header personalizado: x-webhook-token = [tu token]',
          'En el cuerpo del webhook mapear: full_name, phone, email, city',
          'Agregar campo fijo: client_id = [tu client ID de LeadUnlock]',
          'Guardar y enviar evento de prueba',
        ],
        tip: 'Si manejas múltiples sub-cuentas en GHL, cada sub-cuenta puede enviar a un client_id diferente en LeadUnlock.',
      },
    ],
  },
  {
    id: 'n8n',
    number: '03',
    name: 'n8n — El Cerebro',
    subtitle: 'Automatización central sin código',
    color: '#22C55E',
    bg: 'from-green-500/10 to-green-500/5',
    border: 'border-green-500/30',
    icon: '🤖',
    totalTime: '60 min',
    totalCost: '$0 self-hosted / $5/mes Railway',
    steps: [
      {
        id: 'n8n-install',
        title: 'Instalar n8n en Railway',
        time: '20 min',
        cost: '$0 (500 horas gratis/mes) o $5/mes Pro',
        difficulty: 'Fácil',
        description: 'n8n corriendo en la nube, siempre activo, sin servidor propio.',
        tools: [{ name: 'Railway', url: 'https://railway.app' }, { name: 'n8n', url: 'https://n8n.io' }],
        checklist: [
          'Ir a railway.app → New Project → Deploy from Template',
          'Buscar "n8n" en los templates oficiales → Deploy',
          'Railway instala n8n automáticamente (tarda ~2 min)',
          'En la app generada → Settings → Environment Variables agregar:',
          '  N8N_BASIC_AUTH_ACTIVE = true',
          '  N8N_BASIC_AUTH_USER = admin',
          '  N8N_BASIC_AUTH_PASSWORD = [contraseña segura]',
          'Abrir la URL pública que Railway genera (ej: n8n-xxx.railway.app)',
          'Crear cuenta de n8n con tu email',
        ],
        tip: 'Railway ofrece 500 horas gratis al mes. n8n dormido no consume horas — perfecto para empezar sin costo.',
      },
      {
        id: 'n8n-workflow-leads',
        title: 'Workflow: Meta/GHL → LeadUnlock',
        time: '25 min',
        cost: '$0',
        difficulty: 'Media',
        description: 'Cada lead de tus campañas llega a LeadUnlock con los campos correctos.',
        tools: [{ name: 'n8n', url: 'https://n8n.io' }],
        checklist: [
          'En n8n → New Workflow → nombrar "Lead Capture"',
          'Agregar nodo: Webhook (trigger) → copiar la URL generada',
          'Agregar nodo: Set → mapear los campos al formato de LeadUnlock:',
          '  full_name: {{ $json.name }}',
          '  phone: {{ $json.phone }}',
          '  email: {{ $json.email }}',
          '  city: {{ $json.city }}',
          '  client_id: [tu client ID fijo]',
          '  source: Meta Ads',
          'Agregar nodo: HTTP Request → POST a /api/webhook',
          '  Header: x-webhook-token = [tu token]',
          '  Body: campos del nodo Set',
          'Activar el workflow → pegar la URL del webhook en Meta/GHL',
          'Enviar lead de prueba y verificar que aparezca en el dashboard',
        ],
        tip: 'El nodo "Set" de n8n es donde transformas los nombres de campos. Meta llama "full_name", GHL "firstName + lastName" — aquí lo unificas.',
      },
      {
        id: 'n8n-routing',
        title: 'Routing multi-cliente',
        time: '15 min',
        cost: '$0',
        difficulty: 'Media',
        description: 'Enrutar leads a clientes distintos según la campaña o fuente.',
        tools: [{ name: 'n8n', url: 'https://n8n.io' }],
        checklist: [
          'En el workflow de captura, agregar nodo: Switch (antes del HTTP Request)',
          'Condición 1: si campaign_name contiene "hipoteca" → client_id = ABC123',
          'Condición 2: si campaign_name contiene "seguros" → client_id = DEF456',
          'Condición 3: default → client_id = [cliente por defecto]',
          'Cada rama llega al mismo nodo HTTP Request',
          'Probar enviando leads con distintas campañas',
        ],
        tip: 'Con el Switch puedes manejar decenas de clientes con un solo workflow. Cada campaña va al cliente correcto automáticamente.',
      },
    ],
  },
  {
    id: 'notificaciones',
    number: '04',
    name: 'Notificaciones',
    subtitle: 'Alerta instantánea cuando llega un lead',
    color: '#A855F7',
    bg: 'from-purple-500/10 to-purple-500/5',
    border: 'border-purple-500/30',
    icon: '🔔',
    totalTime: '45 min',
    totalCost: '$0-15/mes (WhatsApp API)',
    steps: [
      {
        id: 'whatsapp',
        title: 'Notificación WhatsApp al cliente',
        time: '30 min',
        cost: '$0.006 por mensaje (~$0 en práctica)',
        difficulty: 'Media',
        description: 'El cliente recibe un WhatsApp cuando llega un lead nuevo a su dashboard.',
        tools: [{ name: 'Meta Business', url: 'https://business.facebook.com' }, { name: 'n8n', url: 'https://n8n.io' }],
        checklist: [
          'Activar WhatsApp Business API en Meta Business Suite',
          'Crear número de WhatsApp Business (puede ser el mismo de la empresa)',
          'En Meta: crear plantilla de mensaje aprobada, ej:',
          '  "Hola {{1}}, tienes un lead nuevo: {{2}} de {{3}}. Ver en LeadUnlock."',
          'En n8n, al final del workflow de captura, agregar nodo: HTTP Request',
          'POST a la API de WhatsApp: graph.facebook.com/v18.0/[número]/messages',
          'Header: Authorization = Bearer [token de Meta]',
          'Body: to=[teléfono cliente], template name, parámetros del mensaje',
          'Probar: enviar lead de prueba → verificar WhatsApp recibido',
        ],
        tip: 'La API de WhatsApp de Meta cobra por conversación (~$0.006 MXN), no por mensaje. Un cliente que recibe 100 alertas al mes paga menos de $1.',
      },
      {
        id: 'email-notif',
        title: 'Email automático al lead',
        time: '15 min',
        cost: 'Gratis (Resend free tier)',
        difficulty: 'Fácil',
        description: 'El lead recibe un email de confirmación cuando llena el formulario.',
        tools: [{ name: 'Resend', url: 'https://resend.com' }, { name: 'n8n', url: 'https://n8n.io' }],
        checklist: [
          'Crear cuenta en resend.com (100 emails/día gratis)',
          'Obtener API key → guardar en n8n como credencial',
          'En n8n agregar nodo: Send Email (Resend) al final del workflow',
          'Para: {{ $json.email }}',
          'Asunto: "Recibimos tu solicitud — te contactamos pronto"',
          'Cuerpo: personalizado con nombre y producto de interés',
          'Activar y probar con email real',
        ],
        tip: 'Un email de confirmación inmediato aumenta la tasa de contactación. El lead sabe que fue recibido y espera el call.',
      },
    ],
  },
  {
    id: 'escala',
    number: '05',
    name: 'Escala y Monetización',
    subtitle: 'Convertir el sistema en una máquina de ingresos',
    color: '#EAB308',
    bg: 'from-yellow-500/10 to-yellow-500/5',
    border: 'border-yellow-500/30',
    icon: '🚀',
    totalTime: '2-3 horas',
    totalCost: '$10-30/mes total stack',
    steps: [
      {
        id: 'primer-cliente',
        title: 'Onboardear primeros 3 clientes',
        time: '1 hora',
        cost: '$0',
        difficulty: 'Fácil',
        description: 'Validar el modelo con clientes reales antes de escalar.',
        tools: [],
        checklist: [
          'Identificar 3 negocios con Meta Ads activo (agencias, inmobiliarias, seguros)',
          'Oferta: primeros 5 leads gratis, luego $20 por lead desbloqueado',
          'Crear sus cuentas manualmente en el Admin Dashboard',
          'Ayudarles a configurar el webhook (30 min por cliente)',
          'Esperar 48hs que lleguen leads reales de sus campañas',
          'Cobrar primer pago cuando desbloqueen su primer lead',
        ],
        tip: 'Los primeros 3 clientes son tu prueba de concepto. Haz el onboarding tú mismo, entiende los problemas, luego automatiza.',
      },
      {
        id: 'reporte',
        title: 'Reporte semanal automático',
        time: '30 min',
        cost: '$0',
        difficulty: 'Fácil',
        description: 'Cada lunes el cliente recibe un resumen de sus leads de la semana.',
        tools: [{ name: 'n8n', url: 'https://n8n.io' }],
        checklist: [
          'En n8n → New Workflow → Trigger: Schedule (cada lunes 8am)',
          'Nodo HTTP: GET leads de la semana desde Supabase API',
          'Nodo Set: armar el resumen (total leads, desbloqueados, por campaña)',
          'Nodo Email: enviar reporte al cliente',
          'Activar y probar manualmente primero',
        ],
        tip: 'El reporte semanal reduce el churn. El cliente ve valor tangible cada semana aunque no haya entrado al dashboard.',
      },
      {
        id: 'plan-pro',
        title: 'Activar Plan Pro $97/mes',
        time: '45 min',
        cost: '$0',
        difficulty: 'Media',
        description: 'Clientes de alto volumen pagan mensual y reciben leads incluidos.',
        tools: [{ name: 'Stripe', url: 'https://stripe.com' }],
        checklist: [
          'En Stripe → Products → Create Product: "Plan Pro LeadUnlock"',
          'Precio: $97/mes recurrente',
          'Crear en Supabase columna: clients.plan TEXT DEFAULT free',
          'Crear webhook Stripe para subscription.created → actualizar plan en DB',
          'Agregar en el dashboard un botón "Upgrade a Pro"',
          'Pro incluye: 10 leads desbloqueados + soporte prioritario + analytics',
        ],
        tip: 'Un solo cliente Pro ($97/mes) equivale a casi 5 leads desbloqueados. Con 10 clientes Pro tienes $970/mes recurrente garantizado.',
      },
    ],
  },
]

function ProgressRing({ percent, color, size = 48 }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E293B" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

export default function Roadmap() {
  const [checks, setChecks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
  })
  const [expanded, setExpanded] = useState({ 'supabase': true })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checks))
  }, [checks])

  function toggleCheck(stepId, idx) {
    setChecks(prev => {
      const arr = [...(prev[stepId] || [])]
      arr[idx] = !arr[idx]
      return { ...prev, [stepId]: arr }
    })
  }

  function toggleExpand(stepId) {
    setExpanded(prev => ({ ...prev, [stepId]: !prev[stepId] }))
  }

  function getStepChecks(step) {
    return checks[step.id] || Array(step.checklist.length).fill(false)
  }

  function getPhaseProgress(phase) {
    const total = phase.steps.reduce((s, st) => s + st.checklist.length, 0)
    const done = phase.steps.reduce((s, st) => s + getStepChecks(st).filter(Boolean).length, 0)
    return total > 0 ? Math.round((done / total) * 100) : 0
  }

  const totalItems = PHASES.reduce((s, p) => s + p.steps.reduce((ss, st) => ss + st.checklist.length, 0), 0)
  const totalDone = PHASES.reduce((s, p) => s + p.steps.reduce((ss, st) => ss + getStepChecks(st).filter(Boolean).length, 0), 0)
  const totalProgress = Math.round((totalDone / totalItems) * 100)

  const difficultyColor = { 'Fácil': 'text-green-600 bg-green-50', 'Media': 'text-yellow-600 bg-yellow-50', 'Difícil': 'text-red-600 bg-red-50' }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                    <Zap size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-green-400 uppercase tracking-widest">LeadUnlock CRM</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-2">Roadmap de Implementación</h1>
                <p className="text-slate-400">De cero a sistema completo con Meta Ads + GHL + n8n + WhatsApp</p>
              </div>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <ProgressRing percent={totalProgress} color="#22C55E" size={72} />
                  <span className="absolute text-lg font-bold text-white">{totalProgress}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{totalDone}/{totalItems} pasos</p>
              </div>
            </div>

            {/* Stack visual */}
            <div className="mt-8 flex items-center gap-2 flex-wrap">
              {[
                { label: 'Meta Ads', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                { label: '→', color: 'bg-transparent text-slate-600 border-transparent' },
                { label: 'GHL', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
                { label: '→', color: 'bg-transparent text-slate-600 border-transparent' },
                { label: 'n8n', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
                { label: '→', color: 'bg-transparent text-slate-600 border-transparent' },
                { label: 'LeadUnlock', color: 'bg-slate-700/50 text-white border-slate-600' },
                { label: '→', color: 'bg-transparent text-slate-600 border-transparent' },
                { label: 'Stripe $20', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                { label: '→', color: 'bg-transparent text-slate-600 border-transparent' },
                { label: 'WhatsApp', color: 'bg-green-600/20 text-green-300 border-green-600/30' },
              ].map((item, i) => (
                <span key={i} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${item.color}`}>
                  {item.label}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: 'Tiempo total estimado', value: '~4 horas', icon: '⏱️' },
                { label: 'Costo mensual del stack', value: '$10-30/mes', icon: '💰' },
                { label: 'Fases para completar', value: `${PHASES.length} fases`, icon: '🎯' },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-6">
            {PHASES.map((phase, phaseIdx) => {
              const phaseProgress = getPhaseProgress(phase)
              const isComplete = phaseProgress === 100
              const prevPhaseProgress = phaseIdx === 0 ? 100 : getPhaseProgress(PHASES[phaseIdx - 1])
              const isLocked = false // unlock all for now

              return (
                <div key={phase.id} className={clsx(
                  'rounded-3xl border overflow-hidden transition-all',
                  isComplete ? 'border-opacity-60' : '',
                  phase.border,
                  `bg-gradient-to-br ${phase.bg}`,
                )}>
                  {/* Phase header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <ProgressRing percent={phaseProgress} color={phase.color} size={64} />
                          <span className="absolute inset-0 flex items-center justify-center text-xl">
                            {isComplete ? '✅' : phase.icon}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: phase.color }}>
                            FASE {phase.number}
                          </span>
                          {isComplete && (
                            <span className="text-xs font-semibold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                              ✓ Completada
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-white">{phase.name}</h2>
                        <p className="text-slate-400 text-sm mt-0.5">{phase.subtitle}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock size={13} />
                            {phase.totalTime}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <DollarSign size={13} />
                            {phase.totalCost}
                          </div>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${phaseProgress}%`, background: phase.color }}
                            />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: phase.color }}>
                            {phaseProgress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="px-6 pb-6 space-y-3">
                    {phase.steps.map((step, stepIdx) => {
                      const stepChecks = getStepChecks(step)
                      const stepDone = stepChecks.filter(Boolean).length
                      const stepTotal = step.checklist.length
                      const stepProgress = Math.round((stepDone / stepTotal) * 100)
                      const isStepDone = stepDone === stepTotal
                      const isOpen = expanded[step.id]

                      return (
                        <div
                          key={step.id}
                          className={clsx(
                            'bg-slate-950/80 border rounded-2xl overflow-hidden transition-all',
                            isStepDone ? 'border-green-500/30' : 'border-slate-800',
                          )}
                        >
                          {/* Step header */}
                          <button
                            onClick={() => toggleExpand(step.id)}
                            className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-800/30 transition-colors"
                          >
                            <div className={clsx(
                              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold',
                              isStepDone ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400',
                            )}>
                              {isStepDone ? <Check size={16} /> : `${phaseIdx + 1}.${stepIdx + 1}`}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={clsx('font-semibold', isStepDone ? 'text-slate-400 line-through' : 'text-white')}>
                                  {step.title}
                                </p>
                                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', difficultyColor[step.difficulty])}>
                                  {step.difficulty}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Clock size={11} /> {step.time}
                                </span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <DollarSign size={11} /> {step.cost}
                                </span>
                                <span className="text-xs text-slate-500">{stepDone}/{stepTotal} pasos</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {step.tools.map(tool => (
                                <a
                                  key={tool.name}
                                  href={tool.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="text-xs text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                                >
                                  {tool.name} <ExternalLink size={10} />
                                </a>
                              ))}
                              <div className="text-slate-600 ml-2">
                                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </button>

                          {/* Step content */}
                          {isOpen && (
                            <div className="border-t border-slate-800 p-4 space-y-4">
                              <p className="text-slate-400 text-sm">{step.description}</p>

                              {/* Progress bar */}
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                                    style={{ width: `${stepProgress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500">{stepProgress}%</span>
                              </div>

                              {/* Checklist */}
                              <div className="space-y-2">
                                {step.checklist.map((item, idx) => (
                                  <label
                                    key={idx}
                                    className="flex items-start gap-3 cursor-pointer group p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={stepChecks[idx] || false}
                                      onChange={() => toggleCheck(step.id, idx)}
                                      className="hidden"
                                    />
                                    <div className={clsx(
                                      'w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                                      stepChecks[idx]
                                        ? 'bg-green-500 border-green-500'
                                        : 'border-slate-600 group-hover:border-green-500/50',
                                    )}>
                                      {stepChecks[idx] && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className={clsx(
                                      'text-sm leading-relaxed',
                                      stepChecks[idx] ? 'text-slate-600 line-through' : 'text-slate-300',
                                    )}>
                                      {item.startsWith('  ') ? (
                                        <code className="text-xs bg-slate-800 text-green-400 px-2 py-0.5 rounded font-mono">{item.trim()}</code>
                                      ) : item}
                                    </span>
                                  </label>
                                ))}
                              </div>

                              {/* Tip */}
                              {step.tip && (
                                <div className="flex gap-3 bg-slate-900 border border-slate-700 rounded-xl p-3">
                                  <span className="text-lg flex-shrink-0">💡</span>
                                  <p className="text-xs text-slate-400 leading-relaxed">{step.tip}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
            <p className="text-2xl mb-2">🎯</p>
            <h3 className="font-bold text-white mb-2">Stack completo operando</h3>
            <p className="text-slate-400 text-sm mb-4">
              Cuando completes las 5 fases tendrás un sistema que genera ingresos automáticamente.
            </p>
            <div className="flex justify-center gap-8 text-sm">
              <div>
                <p className="font-bold text-green-400 text-xl">$0</p>
                <p className="text-slate-500 text-xs">costo de infraestructura inicial</p>
              </div>
              <div>
                <p className="font-bold text-green-400 text-xl">$10-30</p>
                <p className="text-slate-500 text-xs">costo mensual en escala</p>
              </div>
              <div>
                <p className="font-bold text-green-400 text-xl">$20</p>
                <p className="text-slate-500 text-xs">por cada lead desbloqueado</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}
